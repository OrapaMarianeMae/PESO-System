<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\JobPosting;
use App\Models\Application;
use App\Models\JobFair;
use App\Models\JobFairEmployer;
use App\Models\JobFairJobseeker;
use App\Models\PlacementResult;
use Illuminate\Http\Request;

class StatisticsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Only administrators can view employment statistics.',
            ], 403);
        }

        $statistics = [
            'total_jobseekers' => User::where('role', 'jobseeker')->count(),

            'total_employers' => User::where('role', 'employer')->count(),

            'active_vacancies' => JobPosting::where('status', 'approved')
                ->where(function ($query) {
                    $query->whereNull('application_deadline')
                        ->orWhereDate('application_deadline', '>=', now()->toDateString());
                })
                ->sum('vacancies'),

            'pending_job_posts' => JobPosting::where('status', 'pending')->count(),

            'total_applications' => Application::count(),

            'upcoming_job_fairs' => JobFair::where('status', 'upcoming')->count(),

            'job_fair_employer_participants' => JobFairEmployer::whereIn('status', [
                'pending',
                'approved',
            ])->count(),

            'job_fair_jobseeker_participants' => JobFairJobseeker::count(),

            'total_placements' => PlacementResult::where(
                'placement_status',
                'placed'
            )->count(),
        ];

        return response()->json([
            'statistics' => $statistics,
        ]);
    }
}