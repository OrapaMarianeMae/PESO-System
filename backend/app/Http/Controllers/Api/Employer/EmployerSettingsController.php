<?php

namespace App\Http\Controllers\Api\Employer;

use App\Http\Controllers\Controller;
use App\Models\EmployerSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class EmployerSettingsController extends Controller
{
    /**
     * Ensure only employer accounts can access these settings.
     */
    private function checkEmployer(Request $request)
    {
        if (!$request->user() || $request->user()->role !== 'employer') {
            return response()->json([
                'message' => 'Only employers can access these settings.',
            ], 403);
        }

        return null;
    }

    /**
     * Load saved employer preferences.
     */
    public function showPreferences(Request $request)
    {
        if ($response = $this->checkEmployer($request)) {
            return $response;
        }

        $settings = EmployerSetting::firstOrCreate([
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'preferences' => $settings,
        ]);
    }

    /**
     * Save account, notification, and privacy preferences.
     */
    public function updatePreferences(Request $request)
    {
        if ($response = $this->checkEmployer($request)) {
            return $response;
        }

        $validated = $request->validate([
            'preferred_contact_method' => [
                'required',
                'in:email,phone',
            ],

            'notify_new_applicants' => ['required', 'boolean'],
            'notify_application_updates' => ['required', 'boolean'],
            'notify_job_approvals' => ['required', 'boolean'],
            'notify_job_fairs' => ['required', 'boolean'],

            'show_company_email' => ['required', 'boolean'],
            'show_company_phone' => ['required', 'boolean'],
            'show_company_address' => ['required', 'boolean'],
        ]);

        $settings = EmployerSetting::firstOrCreate([
            'user_id' => $request->user()->id,
        ]);

        $settings->update($validated);

        return response()->json([
            'message' => 'Settings saved successfully.',
            'preferences' => $settings->fresh(),
        ]);
    }

    /**
     * Securely update the employer's password.
     */
    public function updatePassword(Request $request)
    {
        if ($response = $this->checkEmployer($request)) {
            return $response;
        }

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Your current password is incorrect.',
            ], 422);
        }

        if (Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Your new password must be different from your current password.',
            ], 422);
        }

        $user->password = Hash::make($validated['password']);
        $user->save();

        return response()->json([
            'message' => 'Password updated successfully.',
        ]);
    }
}
