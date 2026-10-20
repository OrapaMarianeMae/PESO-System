<?php

namespace App\Http\Controllers\Api\Jobseeker;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class JobseekerJobController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('job_postings')
            ->join(
                'employer_profiles',
                'job_postings.employer_id',
                '=',
                'employer_profiles.user_id'
            )
            ->select([
                'job_postings.id',
                'job_postings.job_title',
                'job_postings.description',
                'job_postings.location',
                'job_postings.employment_type',
                'job_postings.industry',
                'job_postings.salary',
                'job_postings.requirements',
                'job_postings.skills',
                'job_postings.vacancies',
                'job_postings.application_deadline',
                'employer_profiles.company_name',
                'employer_profiles.company_address',
            ])
            ->where('job_postings.status', 'approved');

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where(
                    'job_postings.job_title',
                    'like',
                    "%{$search}%"
                )
                ->orWhere(
                    'employer_profiles.company_name',
                    'like',
                    "%{$search}%"
                )
                ->orWhere(
                    'job_postings.skills',
                    'like',
                    "%{$search}%"
                );
            });
        }

        if ($request->filled('location')) {
            $query->where(
                'job_postings.location',
                'like',
                '%' . $request->location . '%'
            );
        }

        if ($request->filled('employment_type')) {
            $query->where(
                'job_postings.employment_type',
                $request->employment_type
            );
        }

        if ($request->filled('industry')) {
            $query->where(
                'job_postings.industry',
                $request->industry
            );
        }

        $jobs = $query
            ->orderByDesc('job_postings.created_at')
            ->get();

        return response()->json([
            'jobs' => $jobs,
        ]);
    }
}