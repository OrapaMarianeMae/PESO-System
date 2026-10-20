<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;

class ReportManagementController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Only administrators can manage reports.',
            ], 403);
        }

        $reports = Report::with([
            'reporter:id,first_name,middle_name,surname,email,role',
            'reportedUser:id,first_name,middle_name,surname,email,role',
            'jobPosting:id,job_title,employer_id,status',
        ])
            ->latest()
            ->get();

        return response()->json([
            'reports' => $reports,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Only administrators can update reports.',
            ], 403);
        }

        $validated = $request->validate([
            'status' => [
                'required',
                'in:new,under_review,resolved,dismissed',
            ],
            'admin_notes' => ['nullable', 'string'],
        ]);

        $report = Report::find($id);

        if (!$report) {
            return response()->json([
                'message' => 'Report not found.',
            ], 404);
        }

        $report->update([
            'status' => $validated['status'],
            'admin_notes' => $validated['admin_notes'] ?? $report->admin_notes,
            'resolved_at' => in_array($validated['status'], ['resolved', 'dismissed'])
                ? ($report->resolved_at ?? now())
                : null,
        ]);

        return response()->json([
            'message' => 'Report status updated successfully.',
            'report' => $report->fresh(),
        ]);
    }
}