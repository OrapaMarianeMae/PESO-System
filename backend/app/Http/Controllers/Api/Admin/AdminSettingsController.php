<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AdminSettingsController extends Controller
{
    private function checkAdmin(Request $request)
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Only administrators can access these settings.',
            ], 403);
        }

        return null;
    }

    /**
     * Get administrator account settings.
     */
    public function show(Request $request)
    {
        if ($response = $this->checkAdmin($request)) {
            return $response;
        }

        $user = $request->user();

        return response()->json([
            'settings' => [
                'email' => $user->email,
                'account_role' => $user->role,
                'email_verified' => $user->hasVerifiedEmail(),
                'created_at' => $user->created_at,
            ],
        ]);
    }

    /**
     * Change administrator password.
     */
    public function updatePassword(Request $request)
    {
        if ($response = $this->checkAdmin($request)) {
            return $response;
        }

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],
        ]);

        $user = $request->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => [
                    'Your current password is incorrect.',
                ],
            ]);
        }

        if (Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'password' => [
                    'Your new password must be different from your current password.',
                ],
            ]);
        }

        $user->password = Hash::make($validated['password']);
        $user->save();

        return response()->json([
            'message' => 'Password changed successfully.',
        ]);
    }
}
