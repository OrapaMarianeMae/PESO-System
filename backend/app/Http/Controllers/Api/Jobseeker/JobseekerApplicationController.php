<?php

namespace App\Http\Controllers\Api\Jobseeker;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\JobPosting;
use Illuminate\Http\Request;

class JobseekerApplicationController extends Controller
{
        public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'jobseeker') {
            return response()->json([
                'message' => 'Only jobseekers can view their applications.',
            ], 403);
        }

        $applications = Application::with([
            'jobPosting.employer:id,first_name,middle_name,surname,email',
            'jobPosting.employer.employerProfile',
        ])
            ->where('jobseeker_id', $user->id)
            ->latest('applied_at')
            ->get();

        return response()->json([
            'applications' => $applications,
        ]);
    }

    public function store(Request $request, $jobId)
    {
        $user = $request->user();

        if ($user->role !== 'jobseeker') {
            return response()->json([
                'message' => 'Only jobseekers can apply for jobs.',
            ], 403);
        }

        $job = JobPosting::find($jobId);

        if (!$job) {
            return response()->json([
                'message' => 'Job posting not found.',
            ], 404);
        }

        if ($job->status !== 'approved') {
            return response()->json([
                'message' => 'You can only apply to approved job postings.',
            ], 400);
        }

        if (
            $job->application_deadline &&
            $job->application_deadline->lt(now()->startOfDay())
        ) {
            return response()->json([
                'message' => 'The application deadline has already passed.',
            ], 400);
        }

        $existingApplication = Application::where('jobseeker_id', $user->id)
            ->where('job_posting_id', $job->id)
            ->first();

        if ($existingApplication) {
            return response()->json([
                'message' => 'You have already applied for this job.',
            ], 409);
        }

        $validated = $request->validate([
            'cover_letter' => ['nullable', 'string'],
        ]);

        $application = Application::create([
            'jobseeker_id' => $user->id,
            'job_posting_id' => $job->id,
            'status' => 'submitted',
            'cover_letter' => $validated['cover_letter'] ?? null,
            'applied_at' => now(),
        ]);

        return response()->json([
            'message' => 'Application submitted successfully.',
            'application' => $application,
        ], 201);
    }
}