<?php

namespace App\Http\Controllers\Api\Employer;

use App\Http\Controllers\Controller;
use App\Models\JobPosting;
use Illuminate\Http\Request;

class EmployerJobController extends Controller
{

        public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'employer') {
            return response()->json([
                'message' => 'Only employers can view their job postings.',
            ], 403);
        }

        $jobs = JobPosting::where('employer_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'jobs' => $jobs,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'employer') {
            return response()->json([
                'message' => 'Only employers can create job postings.',
            ], 403);
        }

        $validated = $request->validate([
            'job_title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
            'employment_type' => ['nullable', 'string', 'max:100'],
            'industry' => ['nullable', 'string', 'max:255'],
            'salary' => ['nullable', 'string', 'max:255'],
            'requirements' => ['nullable', 'string'],
            'skills' => ['nullable', 'string'],
            'vacancies' => ['required', 'integer', 'min:1'],
            'application_deadline' => ['nullable', 'date'],
            'educational_attainment' => ['nullable', 'string', 'max:255'],
            'work_experience' => ['nullable', 'string', 'max:255'],
            'work_arrangement' => ['nullable', 'string', 'max:100'],
            'salary_period' => ['nullable', 'string', 'max:50'],
            'benefits' => ['nullable', 'string'],
            'application_instructions' => ['nullable', 'string'],
        ]);

        $job = JobPosting::create([
            'employer_id' => $user->id,
            'job_title' => $validated['job_title'],
            'description' => $validated['description'] ?? null,
            'location' => $validated['location'] ?? null,
            'employment_type' => $validated['employment_type'] ?? null,
            'industry' => $validated['industry'] ?? null,
            'salary' => $validated['salary'] ?? null,
            'requirements' => $validated['requirements'] ?? null,
            'skills' => $validated['skills'] ?? null,
            'vacancies' => $validated['vacancies'],
            'application_deadline' => $validated['application_deadline'] ?? null,
            'educational_attainment' => $validated['educational_attainment'] ?? null,
            'work_experience' => $validated['work_experience'] ?? null,
            'work_arrangement' => $validated['work_arrangement'] ?? null,
            'salary_period' => $validated['salary_period'] ?? null,
            'benefits' => $validated['benefits'] ?? null,
            'application_instructions' => $validated['application_instructions'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Job posting created successfully.',
            'job' => $job,
        ], 201);
    }

        public function update(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role !== 'employer') {
            return response()->json([
                'message' => 'Only employers can update job postings.',
            ], 403);
        }

        $job = JobPosting::where('id', $id)
            ->where('employer_id', $user->id)
            ->first();

        if (!$job) {
            return response()->json([
                'message' => 'Job posting not found.',
            ], 404);
        }

        if ($job->status === 'approved') {
            return response()->json([
                'message' => 'Approved job postings cannot be edited.',
            ], 403);
        }

        $validated = $request->validate([
            'job_title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
            'employment_type' => ['nullable', 'string', 'max:100'],
            'industry' => ['nullable', 'string', 'max:255'],
            'salary' => ['nullable', 'string', 'max:255'],
            'requirements' => ['nullable', 'string'],
            'skills' => ['nullable', 'string'],
            'vacancies' => ['required', 'integer', 'min:1'],
            'application_deadline' => $validated['application_deadline'] ?? null,
            'educational_attainment' => $validated['educational_attainment'] ?? null,
            'work_experience' => $validated['work_experience'] ?? null,
            'work_arrangement' => $validated['work_arrangement'] ?? null,
            'salary_period' => $validated['salary_period'] ?? null,
            'benefits' => $validated['benefits'] ?? null,
            'application_instructions' => $validated['application_instructions'] ?? null,
        ]);

        $job->update($validated);

        return response()->json([
            'message' => 'Job posting updated successfully.',
            'job' => $job->fresh(),
        ]);
    }

        public function close(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role !== 'employer') {
            return response()->json([
                'message' => 'Only employers can close job postings.',
            ], 403);
        }

        $job = JobPosting::where('id', $id)
            ->where('employer_id', $user->id)
            ->first();

        if (!$job) {
            return response()->json([
                'message' => 'Job posting not found.',
            ], 404);
        }

        if ($job->status === 'closed') {
            return response()->json([
                'message' => 'Job posting is already closed.',
            ], 400);
        }

        $job->update([
            'status' => 'closed',
        ]);

        return response()->json([
            'message' => 'Job posting closed successfully.',
            'job' => $job->fresh(),
        ]);
    }

        public function submitForApproval(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role !== 'employer') {
            return response()->json([
                'message' => 'Only employers can submit job postings for approval.',
            ], 403);
        }

        $job = JobPosting::where('id', $id)
            ->where('employer_id', $user->id)
            ->first();

        if (!$job) {
            return response()->json([
                'message' => 'Job posting not found.',
            ], 404);
        }

        if (!in_array($job->status, ['rejected', 'draft'])) {
            return response()->json([
                'message' => 'Only draft or rejected job postings can be submitted for approval.',
            ], 400);
        }

        $job->update([
            'status' => 'pending',
            'rejection_reason' => null,
        ]);

        return response()->json([
            'message' => 'Job posting submitted for PESO approval successfully.',
            'job' => $job->fresh(),
        ]);
    }
}