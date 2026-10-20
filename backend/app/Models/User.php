<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'first_name',
        'middle_name',
        'surname',
        'name_extension',
        'email',
        'password',
        'role',
        'verification_status',
        'can_post_jobs',
        'profile_picture',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'can_post_jobs' => 'boolean',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Profile Relationships
    |--------------------------------------------------------------------------
    */

    public function jobseekerProfile(): HasOne
    {
        return $this->hasOne(JobseekerProfile::class);
    }

    public function employerProfile(): HasOne
    {
        return $this->hasOne(EmployerProfile::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Job & Application Relationships
    |--------------------------------------------------------------------------
    */

    public function jobPostings(): HasMany
    {
        return $this->hasMany(JobPosting::class, 'employer_id');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class, 'jobseeker_id');
    }

    public function savedJobs(): HasMany
    {
        return $this->hasMany(SavedJob::class, 'jobseeker_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Job Fair Relationships
    |--------------------------------------------------------------------------
    */

    public function jobFairEmployers(): HasMany
    {
        return $this->hasMany(JobFairEmployer::class, 'employer_id');
    }

    public function jobFairJobseekers(): HasMany
    {
        return $this->hasMany(JobFairJobseeker::class, 'jobseeker_id');
    }

    public function placementResultsAsJobseeker(): HasMany
    {
        return $this->hasMany(PlacementResult::class, 'jobseeker_id');
    }

    public function placementResultsAsEmployer(): HasMany
    {
        return $this->hasMany(PlacementResult::class, 'employer_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Event Relationships
    |--------------------------------------------------------------------------
    */

    public function eventRegistrations(): HasMany
    {
        return $this->hasMany(EventRegistration::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Report Relationships
    |--------------------------------------------------------------------------
    */

    public function reportsSubmitted(): HasMany
    {
        return $this->hasMany(Report::class, 'reporter_id');
    }

    public function reportsReceived(): HasMany
    {
        return $this->hasMany(Report::class, 'reported_user_id');
    }
}