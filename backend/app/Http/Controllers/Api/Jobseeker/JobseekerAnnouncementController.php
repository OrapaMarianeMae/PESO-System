<?php

namespace App\Http\Controllers\Api\Jobseeker;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;

class JobseekerAnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $announcements = Announcement::where('status', 'published')
            ->where(function ($query) {
                $query->where('visibility', 'all')
                    ->orWhere('visibility', 'jobseekers');
            })
            ->where(function ($query) {
                $query->whereNull('publish_at')
                    ->orWhere('publish_at', '<=', now());
            })
            ->orderByDesc('publish_at')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'announcements' => $announcements,
        ]);
    }
}