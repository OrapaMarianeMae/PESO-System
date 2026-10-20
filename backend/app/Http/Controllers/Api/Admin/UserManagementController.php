<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserManagementController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Only administrators can manage users.',
            ], 403);
        }

        $users = User::with([
            'jobseekerProfile',
            'employerProfile',
        ])
            ->where('role', '!=', 'admin')
            ->latest()
            ->get();

        return response()->json([
            'users' => $users,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Only administrators can update user status.',
            ], 403);
        }

        $validated = $request->validate([
            'verification_status' => [
                'required',
                'in:approved,pending,suspended,rejected',
            ],
        ]);

        $targetUser = User::find($id);

        if (!$targetUser) {
            return response()->json([
                'message' => 'User not found.',
            ], 404);
        }

        if ($targetUser->role === 'admin') {
            return response()->json([
                'message' => 'Administrator accounts cannot be managed here.',
            ], 403);
        }

        $targetUser->update([
            'verification_status' => $validated['verification_status'],
        ]);

        return response()->json([
            'message' => 'User status updated successfully.',
            'user' => $targetUser->fresh(),
        ]);
    }
}