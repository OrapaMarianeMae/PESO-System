<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Only administrators can manage announcements.',
            ], 403);
        }

        $announcements = Announcement::latest('created_at')->get();

        return response()->json([
            'announcements' => $announcements,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Only administrators can create announcements.',
            ], 403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'visibility' => [
                'required',
                'in:all,jobseekers,employers',
            ],
            'status' => [
                'required',
                'in:draft,published',
            ],
            'publish_at' => ['nullable', 'date'],
        ]);

        $announcement = Announcement::create($validated);

        return response()->json([
            'message' => 'Announcement created successfully.',
            'announcement' => $announcement,
        ], 201);
    }

        public function update(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Only administrators can update announcements.',
            ], 403);
        }

        $announcement = Announcement::find($id);

        if (!$announcement) {
            return response()->json([
                'message' => 'Announcement not found.',
            ], 404);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'content' => ['sometimes', 'required', 'string'],
            'visibility' => [
                'sometimes',
                'required',
                'in:all,jobseekers,employers',
            ],
            'status' => [
                'sometimes',
                'required',
                'in:draft,published',
            ],
            'publish_at' => ['nullable', 'date'],
        ]);

        $announcement->update($validated);

        return response()->json([
            'message' => 'Announcement updated successfully.',
            'announcement' => $announcement->fresh(),
        ]);
    }
}