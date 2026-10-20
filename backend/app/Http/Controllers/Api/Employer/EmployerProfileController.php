<?php

namespace App\Http\Controllers\Api\Employer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EmployerProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'employer') {
            return response()->json([
                'message' => 'Only employers can access this profile.',
            ], 403);
        }

        $user->load('employerProfile');

        return response()->json([
            'user' => $this->formatUser($user),
            'profile' => $user->employerProfile,
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'employer') {
            return response()->json([
                'message' => 'Only employers can update this profile.',
            ], 403);
        }

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'surname' => ['required', 'string', 'max:255'],
            'name_extension' => ['nullable', 'string', 'max:50'],

            'company_name' => ['required', 'string', 'max:255'],
            'company_address' => ['nullable', 'string'],
            'company_phone' => ['nullable', 'string', 'max:50'],
            'company_email' => ['nullable', 'email', 'max:255'],
            'industry' => ['nullable', 'string', 'max:255'],
            'company_description' => ['nullable', 'string'],
            'website' => ['nullable', 'string', 'max:255'],
            'contact_person' => ['nullable', 'string', 'max:255'],
            'contact_position' => ['nullable', 'string', 'max:255'],

            'profile_picture' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',
            ],
        ]);

        $user->update([
            'first_name' => $validated['first_name'],
            'middle_name' => $validated['middle_name'] ?? null,
            'surname' => $validated['surname'],
            'name_extension' => $validated['name_extension'] ?? null,
        ]);

        $user->employerProfile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'company_name' => $validated['company_name'],
                'company_address' => $validated['company_address'] ?? null,
                'company_phone' => $validated['company_phone'] ?? null,
                'company_email' => $validated['company_email'] ?? null,
                'industry' => $validated['industry'] ?? null,
                'company_description' => $validated['company_description'] ?? null,
                'website' => $validated['website'] ?? null,
                'contact_person' => $validated['contact_person'] ?? null,
                'contact_position' => $validated['contact_position'] ?? null,
            ]
        );

        if ($request->hasFile('profile_picture')) {
            if ($user->profile_picture) {
                Storage::disk('public')->delete(
                    $user->profile_picture
                );
            }

            $user->profile_picture = $request
                ->file('profile_picture')
                ->store('profile-pictures', 'public');

            $user->save();
        }

        $user->load('employerProfile');

        return response()->json([
            'message' => 'Company profile updated successfully.',
            'user' => $this->formatUser($user),
            'profile' => $user->employerProfile,
        ]);
    }

    private function formatUser($user)
    {
        $user->profile_picture_url = $user->profile_picture
            ? asset('storage/' . $user->profile_picture)
            : null;

        return $user;
    }
}
