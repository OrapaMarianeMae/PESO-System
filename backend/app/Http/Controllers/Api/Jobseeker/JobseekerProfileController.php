<?php

namespace App\Http\Controllers\Api\Jobseeker;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class JobseekerProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'jobseeker') {
            return response()->json([
                'message' => 'Only jobseekers can access this profile.',
            ], 403);
        }

        $user->load('jobseekerProfile');

        return response()->json([
            'user' => $this->formatUser($user),
            'profile' => $user->jobseekerProfile,
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'jobseeker') {
            return response()->json([
                'message' => 'Only jobseekers can update this profile.',
            ], 403);
        }

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'surname' => ['required', 'string', 'max:255'],
            'name_extension' => ['nullable', 'string', 'max:50'],

            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string'],
            'birth_date' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'max:50'],
            'civil_status' => ['nullable', 'string', 'max:50'],

            'education' => ['nullable', 'string', 'max:255'],
            'course' => ['nullable', 'string', 'max:255'],
            'school' => ['nullable', 'string', 'max:255'],

            'skills' => ['nullable', 'string'],
            'work_experience' => ['nullable', 'string'],
            'preferred_job' => ['nullable', 'string', 'max:255'],

            'resume' => [
                'nullable',
                'file',
                'mimes:pdf,doc,docx',
                'max:5120',
            ],

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

        $profile = $user->jobseekerProfile()->first();

        if (!$profile) {
            $profile = $user->jobseekerProfile()->create();
        }

        $profileData = [
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'birth_date' => $validated['birth_date'] ?? null,
            'gender' => $validated['gender'] ?? null,
            'civil_status' => $validated['civil_status'] ?? null,
            'education' => $validated['education'] ?? null,
            'course' => $validated['course'] ?? null,
            'school' => $validated['school'] ?? null,
            'skills' => $validated['skills'] ?? null,
            'work_experience' => $validated['work_experience'] ?? null,
            'preferred_job' => $validated['preferred_job'] ?? null,
        ];

        if ($request->hasFile('resume')) {
            if ($profile->resume) {
                Storage::disk('public')->delete($profile->resume);
            }

            $profileData['resume'] = $request->file('resume')
                ->store('resumes', 'public');
        }

        $profile->update($profileData);

        if ($request->hasFile('profile_picture')) {
            if ($user->profile_picture) {
                Storage::disk('public')->delete($user->profile_picture);
            }

            $user->profile_picture = $request
                ->file('profile_picture')
                ->store('profile-pictures', 'public');

            $user->save();
        }

        $user->load('jobseekerProfile');

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => $this->formatUser($user),
            'profile' => $user->jobseekerProfile,
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
