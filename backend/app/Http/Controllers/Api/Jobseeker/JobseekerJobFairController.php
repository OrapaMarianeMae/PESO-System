<?php

namespace App\Http\Controllers\Api\Jobseeker;

use App\Http\Controllers\Controller;
use App\Models\JobFair;
use Illuminate\Http\Request;

class JobseekerJobFairController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'jobseeker') {
            return response()->json([
                'message' => 'Only jobseekers can view job fairs.',
            ], 403);
        }

        $jobFairs = JobFair::with([
            'employers:id,first_name,middle_name,surname,email',
            'employers.employerProfile',
            'vacancies',
        ])
            ->whereIn('status', ['upcoming', 'ongoing'])
            ->latest('start_date')
            ->get();

        return response()->json([
            'job_fairs' => $jobFairs,
        ]);
    }

        public function register(Request $request, $jobFairId)
    {
        $user = $request->user();

        if ($user->role !== 'jobseeker') {
            return response()->json([
                'message' => 'Only jobseekers can register for job fairs.',
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

        $existingRegistration = \App\Models\JobFairJobseeker::where('job_fair_id', $jobFair->id)
            ->where('jobseeker_id', $user->id)
            ->first();

        if ($existingRegistration) {
            return response()->json([
                'message' => 'You are already registered for this job fair.',
            ], 409);
        }

        $registration = \App\Models\JobFairJobseeker::create([
            'job_fair_id' => $jobFair->id,
            'jobseeker_id' => $user->id,
        ]);

        return response()->json([
            'message' => 'Successfully registered for the job fair.',
            'registration' => $registration,
        ], 201);
    }

        public function registered(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'jobseeker') {
            return response()->json([
                'message' => 'Only jobseekers can view their registered job fairs.',
            ], 403);
        }

        $registrations = \App\Models\JobFairJobseeker::with([
            'jobFair',
        ])
            ->where('jobseeker_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'registrations' => $registrations,
        ]);
    }
}