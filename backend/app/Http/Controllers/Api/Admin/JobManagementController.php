<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\JobPosting;
use Illuminate\Http\Request;

class JobManagementController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Only PESO administrators and staff can manage job postings.',
            ], 403);
        }

        $jobs = JobPosting::with([
            'employer:id,first_name,middle_name,surname,email',
        ])
        ->latest()
        ->get();

        return response()->json([
            'jobs' => $jobs,
        ]);
    }

        public function approve(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Only PESO administrators can approve job postings.',
            ], 403);
        }

        $job = JobPosting::find($id);

        if (!$job) {
            return response()->json([
                'message' => 'Job posting not found.',
            ], 404);
        }

        if ($job->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending job postings can be approved.',
            ], 400);
        }

        $job->update([
            'status' => 'approved',
        ]);

        return response()->json([
            'message' => 'Job posting approved successfully.',
            'job' => $job->fresh(),
        ]);
    }

        public function reject(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Only PESO administrators can reject job postings.',
            ], 403);
        }

        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:2000'],
        ]);

        $job = JobPosting::find($id);

        if (!$job) {
            return response()->json([
                'message' => 'Job posting not found.',
            ], 404);
        }

        if ($job->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending job postings can be rejected.',
            ], 400);
        }

        $job->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        return response()->json([
            'message' => 'Job posting rejected successfully.',
            'job' => $job->fresh(),
        ]);
    }
}