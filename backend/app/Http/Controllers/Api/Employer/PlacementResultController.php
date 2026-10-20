<?php

namespace App\Http\Controllers\Api\Employer;

use App\Http\Controllers\Controller;
use App\Models\PlacementResult;
use App\Models\JobFair;
use App\Models\User;
use App\Models\JobPosting;
use Illuminate\Http\Request;

class PlacementResultController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'employer') {
            return response()->json([
                'message' => 'Only employers can record placement results.',
            ], 403);
        }

        $validated = $request->validate([
            'job_fair_id' => ['required', 'integer', 'exists:job_fairs,id'],
            'jobseeker_id' => ['required', 'integer', 'exists:users,id'],
            'job_posting_id' => ['nullable', 'integer', 'exists:job_postings,id'],
            'interview_status' => [
                'required',
                'in:not_interviewed,scheduled,completed,no_show',
            ],
            'placement_status' => [
                'required',
                'in:pending,placed,not_placed',
            ],
            'notes' => ['nullable', 'string'],
            'result_date' => ['nullable', 'date'],
        ]);

        $jobFair = JobFair::find($validated['job_fair_id']);

        if (!$jobFair) {
            return response()->json([
                'message' => 'Job fair not found.',
            ], 404);
        }

        $jobseeker = User::where('id', $validated['jobseeker_id'])
            ->where('role', 'jobseeker')
            ->first();

        if (!$jobseeker) {
            return response()->json([
                'message' => 'The selected user is not a jobseeker.',
            ], 400);
        }

        if (!empty($validated['job_posting_id'])) {
            $job = JobPosting::where('id', $validated['job_posting_id'])
                ->where('employer_id', $user->id)
                ->first();

            if (!$job) {
                return response()->json([
                    'message' => 'You can only use your own job posting.',
                ], 403);
            }
        }

        $existingResult = PlacementResult::where('job_fair_id', $validated['job_fair_id'])
            ->where('jobseeker_id', $validated['jobseeker_id'])
            ->where('employer_id', $user->id)
            ->first();

        if ($existingResult) {
            return response()->json([
                'message' => 'A placement result already exists for this jobseeker.',
            ], 409);
        }

        $placementResult = PlacementResult::create([
            'job_fair_id' => $validated['job_fair_id'],
            'jobseeker_id' => $validated['jobseeker_id'],
            'employer_id' => $user->id,
            'job_posting_id' => $validated['job_posting_id'] ?? null,
            'interview_status' => $validated['interview_status'],
            'placement_status' => $validated['placement_status'],
            'notes' => $validated['notes'] ?? null,
            'result_date' => $validated['result_date'] ?? null,
        ]);

        return response()->json([
            'message' => 'Placement result recorded successfully.',
            'placement_result' => $placementResult,
        ], 201);
    }
}