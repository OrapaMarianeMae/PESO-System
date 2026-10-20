<?php

namespace App\Http\Controllers\Api\Employer;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\JobPosting;
use Illuminate\Http\Request;

class EmployerReportController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'employer') {
            return response()->json([
                'message' => 'Only employers can view reports.',
            ], 403);
        }

        $jobs = JobPosting::where('employer_id', $user->id);

        $applications = Application::whereHas(
            'jobPosting',
            function ($query) use ($user) {
                $query->where('employer_id', $user->id);
            }
        );

        $jobStats = [
            'total' => (clone $jobs)->count(),
            'pending' => (clone $jobs)->where('status', 'pending')->count(),
            'approved' => (clone $jobs)->where('status', 'approved')->count(),
            'rejected' => (clone $jobs)->where('status', 'rejected')->count(),
            'closed' => (clone $jobs)->where('status', 'closed')->count(),
        ];

        $applicationStats = [
            'total' => (clone $applications)->count(),
            'submitted' => (clone $applications)->where('status', 'submitted')->count(),
            'reviewing' => (clone $applications)->where('status', 'reviewing')->count(),
            'shortlisted' => (clone $applications)->where('status', 'shortlisted')->count(),
            'interview' => (clone $applications)->where('status', 'interview')->count(),
            'hired' => (clone $applications)->where('status', 'hired')->count(),
            'rejected' => (clone $applications)->where('status', 'rejected')->count(),
        ];

        return response()->json([
            'message' => 'Employer reports retrieved successfully.',
            'jobs' => $jobStats,
            'applications' => $applicationStats,
        ]);
    }
}
