<?php

namespace App\Http\Controllers\Api\Jobseeker;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\Request;

class JobseekerEventController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'jobseeker') {
            return response()->json([
                'message' => 'Only jobseekers can view PESO events.',
            ], 403);
        }

            $events = Event::whereIn('status', ['upcoming', 'ongoing'])
            ->latest('start_date')
            ->get();

        return response()->json([
            'events' => $events,
        ]);
    }

        public function register(Request $request, $eventId)
    {
        $user = $request->user();

        if ($user->role !== 'jobseeker') {
            return response()->json([
                'message' => 'Only jobseekers can register for events.',
            ], 403);
        }

        $event = Event::where('id', $eventId)
            ->whereIn('status', ['upcoming', 'ongoing'])
            ->first();

        if (!$event) {
            return response()->json([
                'message' => 'Event not found or registration is unavailable.',
            ], 404);
        }

        $existingRegistration = \App\Models\EventRegistration::where('event_id', $event->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingRegistration) {
            return response()->json([
                'message' => 'You are already registered for this event.',
            ], 409);
        }

        $registration = \App\Models\EventRegistration::create([
            'event_id' => $event->id,
            'user_id' => $user->id,
        ]);

        return response()->json([
            'message' => 'Successfully registered for the event.',
            'registration' => $registration,
        ], 201);
    }

        public function registered(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'jobseeker') {
            return response()->json([
                'message' => 'Only jobseekers can view their registered events.',
            ], 403);
        }

        $registrations = \App\Models\EventRegistration::with([
            'event',
        ])
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'registrations' => $registrations,
        ]);
    }
}