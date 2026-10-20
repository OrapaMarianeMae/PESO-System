<?php

namespace App\Http\Controllers\Api\Employer;

use App\Http\Controllers\Controller;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EmployerApplicantController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'employer') {
            return response()->json([
                'message' => 'Only employers can view applicants.',
            ], 403);
        }

        $applications = Application::with([
            'jobPosting:id,employer_id,job_title,location,employment_type,status',
            'jobseeker:id,first_name,middle_name,surname,email',
            'jobseeker.jobseekerProfile',
        ])
            ->whereHas('jobPosting', function ($query) use ($user) {
                $query->where('employer_id', $user->id);
            })
            ->latest('applied_at')
            ->get();

        return response()->json([
            'applications' => $applications,
        ]);
    }

        public function updateStatus(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role !== 'employer') {
            return response()->json([
                'message' => 'Only employers can update applicant status.',
            ], 403);
        }

        $validated = $request->validate([
            'status' => [
                'required',
                'in:submitted,reviewing,shortlisted,interview,hired,rejected',
            ],
        ]);

        $application = Application::with('jobPosting')
            ->where('id', $id)
            ->first();

        if (!$application) {
            return response()->json([
                'message' => 'Application not found.',
            ], 404);
        }

        if ($application->jobPosting->employer_id !== $user->id) {
            return response()->json([
                'message' => 'You can only update applicants for your own job postings.',
            ], 403);
        }

        $application->update([
            'status' => $validated['status'],
            'reviewed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Applicant status updated successfully.',
            'application' => $application->fresh(),
        ]);
    }

        public function viewResume(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role !== 'employer') {
            return response()->json([
                'message' => 'Only employers can view applicant resumes.',
            ], 403);
        }

        $application = Application::with([
            'jobPosting',
            'jobseeker.jobseekerProfile',
        ])->find($id);

        if (!$application) {
            return response()->json([
                'message' => 'Application not found.',
            ], 404);
        }

        if (
            !$application->jobPosting ||
            $application->jobPosting->employer_id != $user->id
        ) {
            return response()->json([
                'message' => 'You can only view resumes for your own job postings.',
            ], 403);
        }

        $resume = $application->jobseeker?->jobseekerProfile?->resume;

        if (!$resume) {
            return response()->json([
                'message' => 'This applicant has not uploaded a resume.',
            ], 404);
        }

        $disk = Storage::disk('public');

        if (!$disk->exists($resume)) {
            return response()->json([
                'message' => 'The resume file could not be found.',
            ], 404);
        }

        $extension = strtolower(pathinfo($resume, PATHINFO_EXTENSION));

        if ($extension !== 'pdf') {
            return response()->json([
                'message' => 'Only PDF resumes can be viewed in the browser.',
            ], 415);
        }

        return response()->stream(
            function () use ($disk, $resume) {
                $stream = $disk->readStream($resume);

                if ($stream === false) {
                    return;
                }

                fpassthru($stream);
                fclose($stream);
            },
            200,
            [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="resume.pdf"',
                'Cache-Control' => 'private, no-store',
                'X-Content-Type-Options' => 'nosniff',
            ]
        );
    }
}