<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\PasswordController;
use App\Http\Controllers\Api\Jobseeker\JobseekerProfileController;
use App\Http\Controllers\Api\Employer\EmployerProfileController;
use App\Http\Controllers\Api\Employer\EmployerJobController;
use App\Http\Controllers\Api\Admin\JobManagementController;
use App\Http\Controllers\Api\Jobseeker\JobseekerJobController;
use App\Http\Controllers\Api\Jobseeker\JobseekerApplicationController;
use App\Http\Controllers\Api\Employer\EmployerApplicantController;
use App\Http\Controllers\Api\Jobseeker\JobseekerSavedJobController;
use App\Http\Controllers\Api\Jobseeker\JobseekerJobFairController;
use App\Http\Controllers\Api\Jobseeker\JobseekerEventController;
use App\Http\Controllers\Api\Jobseeker\JobseekerReportController;
use App\Http\Controllers\Api\Jobseeker\JobseekerAnnouncementController;
use App\Http\Controllers\Api\Jobseeker\NotificationController;
use App\Http\Controllers\Api\Jobseeker\NotificationPreferenceController;
use App\Http\Controllers\Api\Employer\EmployerJobFairController;
use App\Http\Controllers\Api\Employer\PlacementResultController;
use App\Http\Controllers\Api\Admin\UserManagementController;
use App\Http\Controllers\Api\Admin\JobFairManagementController;
use App\Http\Controllers\Api\Admin\AnnouncementController;
use App\Http\Controllers\Api\Admin\EventManagementController;
use App\Http\Controllers\Api\Admin\ReportManagementController;
use App\Http\Controllers\Api\Admin\StatisticsController;
use App\Http\Controllers\Api\Admin\AdminProfileController;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use App\Http\Controllers\Api\Employer\EmployerReportController;
use App\Http\Controllers\Api\Employer\EmployerSettingsController;
use App\Http\Controllers\Api\Employer\EmployerNotificationController;
use App\Http\Controllers\Api\Admin\AdminSettingsController;



Route::get('/me', function (Request $request) {
    return $request->user()->load([
        'jobseekerProfile',
        'employerProfile',
    ]);
})->middleware('auth:sanctum');

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Email Verification
|--------------------------------------------------------------------------
*/

Route::get('/email/verify/{id}/{hash}', function ($id, $hash) {
    $user = \App\Models\User::findOrFail($id);

    if (! hash_equals(
        sha1($user->getEmailForVerification()),
        $hash
    )) {
        return response()->json([
            'message' => 'Invalid verification link.',
        ], 403);
    }

    if ($user->hasVerifiedEmail()) {
        return response()->json([
            'message' => 'Email address is already verified.',
        ]);
    }

    $user->markEmailAsVerified();

    return response()->json([
        'message' => 'Email verified successfully.',
    ]);
})->middleware('signed')->name('verification.verify');

Route::post('/email/verification-notification', function (Request $request) {
    if ($request->user()->hasVerifiedEmail()) {
        return response()->json([
            'message' => 'Email address is already verified.',
        ], 400);
    }

    $request->user()->sendEmailVerificationNotification();

    return response()->json([
        'message' => 'Verification email sent.',
    ]);
})->middleware('auth:sanctum')->name('verification.send');

Route::post('/logout', [AuthController::class, 'logout'])
    ->middleware('auth:sanctum');
    Route::put('/account/password', [PasswordController::class, 'update'])
    ->middleware('auth:sanctum');

Route::get('/jobseeker/profile', [JobseekerProfileController::class, 'show'])
    ->middleware('auth:sanctum');
Route::put('/jobseeker/profile', [JobseekerProfileController::class, 'update'])
    ->middleware('auth:sanctum');

Route::get('/employer/profile', [EmployerProfileController::class, 'show'])
    ->middleware('auth:sanctum');
Route::put('/employer/profile', [EmployerProfileController::class, 'update'])
    ->middleware('auth:sanctum');

Route::post('/employer/jobs', [EmployerJobController::class, 'store'])
    ->middleware('auth:sanctum');
Route::get('/employer/jobs', [EmployerJobController::class, 'index'])
    ->middleware('auth:sanctum');
    Route::put('/employer/jobs/{id}', [EmployerJobController::class, 'update'])
    ->middleware('auth:sanctum');
Route::put('/employer/jobs/{id}/close', [EmployerJobController::class, 'close'])
    ->middleware('auth:sanctum');
Route::put('/employer/jobs/{id}/submit', [EmployerJobController::class, 'submitForApproval'])
    ->middleware('auth:sanctum');


Route::get('/employer/settings/preferences', [
    EmployerSettingsController::class,
    'showPreferences',
])->middleware('auth:sanctum');

Route::put('/employer/settings/preferences', [
    EmployerSettingsController::class,
    'updatePreferences',
])->middleware('auth:sanctum');

Route::put('/employer/settings/password', [
    EmployerSettingsController::class,
    'updatePassword',
])->middleware('auth:sanctum');


Route::get('/admin/jobs', [JobManagementController::class, 'index'])
    ->middleware('auth:sanctum');
    Route::put('/admin/jobs/{id}/approve', [JobManagementController::class, 'approve'])
    ->middleware('auth:sanctum');
Route::put('/admin/jobs/{id}/reject', [JobManagementController::class, 'reject'])
    ->middleware('auth:sanctum');

Route::get('/jobseeker/jobs', [JobseekerJobController::class, 'index'])
    ->middleware('auth:sanctum');
Route::post('/jobseeker/jobs/{jobId}/apply', [JobseekerApplicationController::class, 'store'])
    ->middleware('auth:sanctum');
Route::get('/jobseeker/applications', [JobseekerApplicationController::class, 'index'])
    ->middleware('auth:sanctum');

Route::get('/employer/applications', [EmployerApplicantController::class, 'index'])
    ->middleware('auth:sanctum');
Route::put('/employer/applications/{id}/status', [EmployerApplicantController::class, 'updateStatus'])
    ->middleware('auth:sanctum');

Route::get('/employer/applications/{id}/resume', [EmployerApplicantController::class, 'viewResume'])
    ->middleware('auth:sanctum');

Route::get('/employer/reports', [EmployerReportController::class, 'index'])
    ->middleware('auth:sanctum');

Route::post('/jobseeker/jobs/{jobId}/save', [JobseekerSavedJobController::class, 'store'])
    ->middleware('auth:sanctum');
Route::delete('/jobseeker/jobs/{jobId}/save', [JobseekerSavedJobController::class, 'destroy'])
    ->middleware('auth:sanctum');
Route::get('/jobseeker/saved-jobs', [JobseekerSavedJobController::class, 'index'])
    ->middleware('auth:sanctum');

Route::get('/jobseeker/job-fairs', [JobseekerJobFairController::class, 'index'])
    ->middleware('auth:sanctum');
Route::post('/jobseeker/job-fairs/{jobFairId}/register', [JobseekerJobFairController::class, 'register'])
    ->middleware('auth:sanctum');
Route::get('/jobseeker/job-fairs/registered', [JobseekerJobFairController::class, 'registered'])
    ->middleware('auth:sanctum');

Route::get('/jobseeker/events', [JobseekerEventController::class, 'index'])
    ->middleware('auth:sanctum');
Route::post('/jobseeker/events/{eventId}/register', [JobseekerEventController::class, 'register'])
    ->middleware('auth:sanctum');
Route::get('/jobseeker/events/registered', [JobseekerEventController::class, 'registered'])
    ->middleware('auth:sanctum');

Route::get('/jobseeker/announcements', [JobseekerAnnouncementController::class, 'index'])
    ->middleware('auth:sanctum');

Route::post('/jobseeker/reports', [JobseekerReportController::class, 'store'])
    ->middleware('auth:sanctum');
Route::get('/jobseeker/reports', [JobseekerReportController::class, 'index'])
    ->middleware('auth:sanctum');

Route::get('/jobseeker/notification-preferences', [NotificationPreferenceController::class, 'show',])
    ->middleware('auth:sanctum');

Route::put('/jobseeker/notification-preferences', [NotificationPreferenceController::class, 'update',])
    ->middleware('auth:sanctum');
    
Route::middleware('auth:sanctum')->group(function () {
Route::get('/jobseeker/notifications', [NotificationController::class, 'index',]);

Route::patch('/jobseeker/notifications/{id}/read', [NotificationController::class, 'markAsRead',]);

Route::patch('/jobseeker/notifications/read-all', [NotificationController::class, 'markAllAsRead',]);

});


Route::get('/employer/job-fairs', [EmployerJobFairController::class, 'index'])
    ->middleware('auth:sanctum');
Route::post('/employer/job-fairs/{jobFairId}/register', [EmployerJobFairController::class, 'register'])
    ->middleware('auth:sanctum');
Route::post('/employer/job-fairs/{jobFairId}/vacancies', [EmployerJobFairController::class, 'addVacancy'])
    ->middleware('auth:sanctum');
Route::get('/employer/job-fairs/my', [EmployerJobFairController::class, 'myJobFairs'])
    ->middleware('auth:sanctum');

Route::post('/employer/placement-results', [PlacementResultController::class, 'store'])
    ->middleware('auth:sanctum');


Route::get('/employer/notifications', [
    EmployerNotificationController::class,
    'index',
])->middleware('auth:sanctum');

Route::patch('/employer/notifications/{id}/read', [
    EmployerNotificationController::class,
    'markAsRead',
])->middleware('auth:sanctum');

Route::patch('/employer/notifications/read-all', [
    EmployerNotificationController::class,
    'markAllAsRead',
])->middleware('auth:sanctum');


Route::get('/admin/users', [UserManagementController::class, 'index'])
    ->middleware('auth:sanctum');
Route::put('/admin/users/{id}/status', [UserManagementController::class, 'updateStatus'])
    ->middleware('auth:sanctum');

Route::get('/admin/job-fairs', [JobFairManagementController::class, 'index'])
    ->middleware('auth:sanctum');
Route::post('/admin/job-fairs', [JobFairManagementController::class, 'store'])
    ->middleware('auth:sanctum');
Route::put('/admin/job-fairs/{id}', [JobFairManagementController::class, 'update'])
    ->middleware('auth:sanctum');
Route::put('/admin/job-fairs/employers/{id}/status', [JobFairManagementController::class, 'updateEmployerStatus'])
    ->middleware('auth:sanctum');

Route::get('/admin/announcements', [AnnouncementController::class, 'index'])
    ->middleware('auth:sanctum');
Route::post('/admin/announcements', [AnnouncementController::class, 'store'])
    ->middleware('auth:sanctum');
Route::put('/admin/announcements/{id}', [AnnouncementController::class, 'update'])
    ->middleware('auth:sanctum');

Route::get('/employer/announcements', function (\Illuminate\Http\Request $request) {
    if ($request->user()->role !== 'employer') {
        return response()->json([
            'message' => 'Only employers can view these announcements.',
        ], 403);
    }

    $announcements = \App\Models\Announcement::where('status', 'published')
        ->where(function ($query) {
            $query->whereIn('visibility', ['all', 'employers']);
        })
        ->where(function ($query) {
            $query->whereNull('publish_at')
                ->orWhere('publish_at', '<=', now());
        })
        ->latest('created_at')
        ->get();

    return response()->json([
        'announcements' => $announcements,
    ]);
})->middleware('auth:sanctum');

Route::get('/admin/events', [EventManagementController::class, 'index'])
    ->middleware('auth:sanctum');
Route::post('/admin/events', [EventManagementController::class, 'store'])
    ->middleware('auth:sanctum');
Route::put('/admin/events/{id}', [EventManagementController::class, 'update'])
    ->middleware('auth:sanctum');

Route::get('/admin/reports', [ReportManagementController::class, 'index'])
    ->middleware('auth:sanctum');
Route::put('/admin/reports/{id}/status', [ReportManagementController::class, 'updateStatus'])
    ->middleware('auth:sanctum');

Route::get('/admin/statistics', [StatisticsController::class, 'index'])
    ->middleware('auth:sanctum');

Route::get('/admin/profile', [AdminProfileController::class, 'show'])
    ->middleware('auth:sanctum');   
Route::put('/admin/profile', [AdminProfileController::class, 'update'])
    ->middleware('auth:sanctum');Route::get('/admin/settings', [
    AdminSettingsController::class,
    'show',
])->middleware('auth:sanctum');

Route::put('/admin/settings/password', [
    AdminSettingsController::class,
    'updatePassword',
])->middleware('auth:sanctum');


