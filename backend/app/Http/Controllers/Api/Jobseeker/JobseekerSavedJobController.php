<?php

namespace App\Http\Controllers\Api\Jobseeker;

use App\Http\Controllers\Controller;
use App\Models\JobPosting;
use App\Models\SavedJob;
use Illuminate\Http\Request;

class JobseekerSavedJobController extends Controller
{
    public function store(Request $request, $jobId)
    {
        $user = $request->user();

        if ($user->role !== 'jobseeker') {
            return response()->json([
                'message' => 'Only jobseekers can save jobs.',
            ], 403);
        }

        $job = JobPosting::where('id', $jobId)
            ->where('status', 'approved')
            ->first();

        if (!$job) {
            return response()->json([
                'message' => 'Approved job posting not found.',
            ], 404);
        }

        $existingSavedJob = SavedJob::where('jobseeker_id', $user->id)
            ->where('job_posting_id', $job->id)
            ->first();

        if ($existingSavedJob) {
            return response()->json([
                'message' => 'Job is already saved.',
            ], 409);
        }

        $savedJob = SavedJob::create([
            'jobseeker_id' => $user->id,
            'job_posting_id' => $job->id,
        ]);

        return response()->json([
            'message' => 'Job saved successfully.',
            'saved_job' => $savedJob,
        ], 201);
    }

    public function destroy(Request $request, $jobId)
    {
        $user = $request->user();

        if ($user->role !== 'jobseeker') {
            return response()->json([
                'message' => 'Only jobseekers can remove saved jobs.',
            ], 403);
        }

        $savedJob = SavedJob::where('jobseeker_id', $user->id)
            ->where('job_posting_id', $jobId)
            ->first();

        if (!$savedJob) {
            return response()->json([
                'message' => 'Saved job not found.',
            ], 404);
        }

        $savedJob->delete();

        return response()->json([
            'message' => 'Job removed from saved jobs successfully.',
        ]);
    }

        public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'jobseeker') {
            return response()->json([
                'message' => 'Only jobseekers can view saved jobs.',
            ], 403);
        }

        $savedJobs = SavedJob::with([
            'jobPosting.employer:id,first_name,middle_name,surname,email',
            'jobPosting.employer.employerProfile',
        ])
            ->where('jobseeker_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'saved_jobs' => $savedJobs,
        ]);
    }
}