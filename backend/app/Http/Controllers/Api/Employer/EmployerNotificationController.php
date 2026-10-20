<?php

namespace App\Http\Controllers\Api\Employer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class EmployerNotificationController extends Controller
{
    /**
     * Get notifications for the logged-in employer.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user || $user->role !== 'employer') {
            return response()->json([
                'message' => 'Only employers can access these notifications.',
            ], 403);
        }

        $notifications = $user->notifications()
            ->latest()
            ->limit(30)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->data['type'] ?? 'general',
                    'title' => $notification->data['title'] ?? 'PESO Notification',
                    'message' => $notification->data['message'] ?? '',
                    'url' => $notification->data['url'] ?? null,
                    'read_at' => $notification->read_at,
                    'created_at' => $notification->created_at,
                ];
            });

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $user->unreadNotifications()->count(),
        ]);
    }

    /**
     * Mark one notification belonging to this employer as read.
     */
    public function markAsRead(Request $request, string $id)
    {
        $user = $request->user();

        if (!$user || $user->role !== 'employer') {
            return response()->json([
                'message' => 'Only employers can access these notifications.',
            ], 403);
        }

        $notification = $user->notifications()
            ->where('id', $id)
            ->first();

        if (!$notification) {
            return response()->json([
                'message' => 'Notification not found.',
            ], 404);
        }

        $notification->markAsRead();

        return response()->json([
            'message' => 'Notification marked as read.',
            'unread_count' => $user->unreadNotifications()->count(),
        ]);
    }

    /**
     * Mark all notifications belonging to this employer as read.
     */
    public function markAllAsRead(Request $request)
    {
        $user = $request->user();

        if (!$user || $user->role !== 'employer') {
            return response()->json([
                'message' => 'Only employers can access these notifications.',
            ], 403);
        }

        $user->unreadNotifications()->update([
            'read_at' => now(),
        ]);

        return response()->json([
            'message' => 'All notifications marked as read.',
            'unread_count' => 0,
        ]);
    }
}
