<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\JobFair;
use Illuminate\Http\Request;

class JobFairManagementController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Only administrators can manage job fairs.',
            ], 403);
        }

        $jobFairs = JobFair::withCount([
            'employerRegistrations',
            'jobseekerRegistrations',
        ])
            ->with([
                'employerRegistrations.employer.employerProfile',
                'jobseekerRegistrations.jobseeker',
                'vacancies',
                'placementResults',
            ])
            ->latest('start_date')
            ->get();

        return response()->json([
            'job_fairs' => $jobFairs,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Only administrators can create job fairs.',
            ], 403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'venue' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'registration_start' => ['nullable', 'date'],
            'registration_end' => ['nullable', 'date', 'after_or_equal:registration_start'],
            'status' => [
                'required',
                'in:draft,upcoming,ongoing,completed,cancelled',
            ],
        ]);

        $jobFair = JobFair::create($validated);

        return response()->json([
            'message' => 'Job fair created successfully.',
            'job_fair' => $jobFair,
        ], 201);
    }

        public function update(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Only administrators can update job fairs.',
            ], 403);
        }

        $jobFair = JobFair::find($id);

        if (!$jobFair) {
            return response()->json([
                'message' => 'Job fair not found.',
            ], 404);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'venue' => ['sometimes', 'required', 'string', 'max:255'],
            'start_date' => ['sometimes', 'required', 'date'],
            'end_date' => ['sometimes', 'required', 'date', 'after_or_equal:start_date'],
            'registration_start' => ['nullable', 'date'],
            'registration_end' => ['nullable', 'date', 'after_or_equal:registration_start'],
            'status' => [
                'sometimes',
                'required',
                'in:draft,upcoming,ongoing,completed,cancelled',
            ],
        ]);

        $jobFair->update($validated);

        return response()->json([
            'message' => 'Job fair updated successfully.',
            'job_fair' => $jobFair->fresh(),
        ]);
    }

        public function updateEmployerStatus(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Only administrators can manage employer participation.',
            ], 403);
        }

        $validated = $request->validate([
            'status' => [
                'required',
                'in:pending,approved,rejected,cancelled',
            ],
        ]);

        $registration = \App\Models\JobFairEmployer::with([
            'jobFair',
            'employer',
        ])->find($id);

        if (!$registration) {
            return response()->json([
                'message' => 'Employer job fair registration not found.',
            ], 404);
        }

        $registration->update([
            'status' => $validated['status'],
            'registered_at' => $validated['status'] === 'approved'
                ? ($registration->registered_at ?? now())
                : $registration->registered_at,
        ]);

        return response()->json([
            'message' => 'Employer participation status updated successfully.',
            'registration' => $registration->fresh([
                'jobFair',
                'employer',
            ]),
        ]);
    }
}