<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'surname' => ['required', 'string', 'max:255'],
            'name_extension' => ['nullable', 'string', 'max:50'],

            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email',
            ],

            'password' => [
                'required',
                'string',
                'confirmed',
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],

            'role' => [
                'required',
                'in:jobseeker,employer',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Create User
        |--------------------------------------------------------------------------
        */

        $user = User::create([
            'first_name' => $validated['first_name'],
            'middle_name' => $validated['middle_name'] ?? null,
            'surname' => $validated['surname'],
            'name_extension' => $validated['name_extension'] ?? null,
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'verification_status' => 'approved',
            'can_post_jobs' => $validated['role'] === 'employer',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Create Role-Specific Profile
        |--------------------------------------------------------------------------
        */

        if ($validated['role'] === 'jobseeker') {
            $user->jobseekerProfile()->create();
        }

        if ($validated['role'] === 'employer') {
            $user->employerProfile()->create([
                'company_name' =>
                    $validated['first_name'] . ' ' . $validated['surname'],
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Send Email Verification
        |--------------------------------------------------------------------------
        */

        $user->sendEmailVerificationNotification();

        /*
        |--------------------------------------------------------------------------
        | Registration Response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'message' => 'Registration successful. Please verify your email address before logging in.',
            'verification_required' => true,
            'email' => $user->email,
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (
            !$user ||
            !Hash::check($validated['password'], $user->password)
        ) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Require Email Verification
        |--------------------------------------------------------------------------
        */

        if (!$user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Please verify your email address before logging in.',
                'verification_required' => true,
                'email' => $user->email,
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Create API Token
        |--------------------------------------------------------------------------
        */

        $token = $user->createToken('peso-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'user' => $user->load([
                'jobseekerProfile',
                'employerProfile',
            ]),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout successful.',
        ]);
    }
}