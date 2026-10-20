<?php

namespace App\Http\Controllers\Api\Employer;

use App\Http\Controllers\Controller;
use App\Models\JobFair;
use Illuminate\Http\Request;

class EmployerJobFairController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'employer') {
            return response()->json([
                'message' => 'Only employers can view job fairs.',
            ], 403);
        }

        $jobFairs = JobFair::whereIn('status', ['upcoming', 'ongoing'])
            ->latest('start_date')
            ->get();

        return response()->json([
            'job_fairs' => $jobFairs,
        ]);
    }

        public function register(Request $request, $jobFairId)
    {
        $user = $request->user();

        if ($user->role !== 'employer') {
            return response()->json([
                'message' => 'Only employers can register for job fairs.',
            ], 403);
        }

        $jobFair = JobFair::where('id', $jobFairId)
            ->whereIn('status', ['upcoming', 'ongoing'])
            ->first();

        if (!$jobFair) {
            return response()->json([
                'message' => 'Job fair not found or registration is unavailable.',
            ], 404);
        }

        $existingRegistration = \App\Models\JobFairEmployer::where('job_fair_id', $jobFair->id)
            ->where('employer_id', $user->id)
            ->first();

        if ($existingRegistration) {
            return response()->json([
                'message' => 'You are already registered for this job fair.',
            ], 409);
        }

        $registration = \App\Models\JobFairEmployer::create([
            'job_fair_id' => $jobFair->id,
            'employer_id' => $user->id,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Successfully registered for the job fair.',
            'registration' => $registration,
        ], 201);
    }

        public function addVacancy(Request $request, $jobFairId)
    {
        $user = $request->user();

        if ($user->role !== 'employer') {
            return response()->json([
                'message' => 'Only employers can submit job fair vacancies.',
            ], 403);
        }

        $validated = $request->validate([
            'job_posting_id' => ['required', 'integer', 'exists:job_postings,id'],
            'vacancies_offered' => ['required', 'integer', 'min:1'],
        ]);

        $jobFair = JobFair::where('id', $jobFairId)
            ->whereIn('status', ['upcoming', 'ongoing'])
            ->first();

        if (!$jobFair) {
            return response()->json([
                'message' => 'Job fair not found or unavailable.',
            ], 404);
        }

        $registration = \App\Models\JobFairEmployer::where('job_fair_id', $jobFair->id)
            ->where('employer_id', $user->id)
            ->first();

        if (!$registration) {
            return response()->json([
                'message' => 'You must register for this job fair before submitting vacancies.',
            ], 400);
        }

        $job = \App\Models\JobPosting::where('id', $validated['job_posting_id'])
            ->where('employer_id', $user->id)
            ->where('status', 'approved')
            ->first();

        if (!$job) {
            return response()->json([
                'message' => 'You can only submit your own approved job postings.',
            ], 400);
        }

        $existingVacancy = \App\Models\JobFairVacancy::where('job_fair_id', $jobFair->id)
            ->where('job_posting_id', $job->id)
            ->first();

        if ($existingVacancy) {
            return response()->json([
                'message' => 'This job posting is already added to this job fair.',
            ], 409);
        }

        $vacancy = \App\Models\JobFairVacancy::create([
            'job_fair_id' => $jobFair->id,
            'job_posting_id' => $job->id,
            'vacancies_offered' => $validated['vacancies_offered'],
            'status' => 'active',
        ]);

        return response()->json([
            'message' => 'Job fair vacancy submitted successfully.',
            'vacancy' => $vacancy,
        ], 201);
    }

        public function myJobFairs(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'employer') {
            return response()->json([
                'message' => 'Only employers can view their job fair participation.',
            ], 403);
        }

        $registrations = \App\Models\JobFairEmployer::with([
            'jobFair',
            'jobFair.vacancies.jobPosting',
        ])
            ->where('employer_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'registrations' => $registrations,
        ]);
    }
}