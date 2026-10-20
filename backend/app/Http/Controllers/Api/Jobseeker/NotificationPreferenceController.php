<?php

namespace App\Http\Controllers\Api\Jobseeker;

use App\Http\Controllers\Controller;
use App\Models\NotificationPreference;
use Illuminate\Http\Request;

class NotificationPreferenceController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();

        $preferences = NotificationPreference::firstOrCreate(
            ['user_id' => $user->id],
            [
                'job_alerts' => true,
                'application_updates' => true,
                'peso_announcements' => true,
            ]
        );

        return response()->json([
            'preferences' => $preferences,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'job_alerts' => ['required', 'boolean'],
            'application_updates' => ['required', 'boolean'],
            'peso_announcements' => ['required', 'boolean'],
        ]);

        $preferences = NotificationPreference::updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return response()->json([
            'message' => 'Notification preferences saved successfully.',
            'preferences' => $preferences,
        ]);
    }
}
