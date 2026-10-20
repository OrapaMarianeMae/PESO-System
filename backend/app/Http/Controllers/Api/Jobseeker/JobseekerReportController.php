<?php

namespace App\Http\Controllers\Api\Jobseeker;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\User;
use App\Models\JobPosting;
use Illuminate\Http\Request;

class JobseekerReportController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'jobseeker') {
            return response()->json([
                'message' => 'Only jobseekers can submit employer reports.',
            ], 403);
        }

        $validated = $request->validate([
            'reported_user_id' => ['required', 'integer', 'exists:users,id'],
            'job_posting_id' => ['nullable', 'integer', 'exists:job_postings,id'],
            'reason' => ['required', 'string', 'max:255'],
            'details' => ['nullable', 'string'],
        ]);

        $reportedUser = User::find($validated['reported_user_id']);

        if ($reportedUser->role !== 'employer') {
            return response()->json([
                'message' => 'You can only report employer accounts.',
            ], 400);
        }

        if (!empty($validated['job_posting_id'])) {
            $job = JobPosting::find($validated['job_posting_id']);

            if (!$job || $job->employer_id !== $reportedUser->id) {
                return response()->json([
                    'message' => 'The selected job posting does not belong to this employer.',
                ], 400);
            }
        }

        $report = Report::create([
            'reporter_id' => $user->id,
            'reported_user_id' => $validated['reported_user_id'],
            'job_posting_id' => $validated['job_posting_id'] ?? null,
            'reason' => $validated['reason'],
            'details' => $validated['details'] ?? null,
            'status' => 'new',
        ]);

        return response()->json([
            'message' => 'Employer report submitted successfully.',
            'report' => $report,
        ], 201);
    }

        public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'jobseeker') {
            return response()->json([
                'message' => 'Only jobseekers can view their reports.',
            ], 403);
        }

        $reports = Report::with([
            'reportedUser:id,first_name,middle_name,surname,email',
            'jobPosting:id,job_title,employer_id,status',
        ])
            ->where('reporter_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'reports' => $reports,
        ]);
    }
}