<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobPosting extends Model
{
    use HasFactory;

    protected $fillable = [
        'employer_id',
        'job_title',
        'description',
        'location',
        'employment_type',
        'industry',
        'salary',
        'requirements',
        'skills',
        'vacancies',
        'application_deadline',
        'status',
        'rejection_reason',
        'educational_attainment',
        'work_experience',
        'work_arrangement',
        'salary_period',
        'benefits',
        'application_instructions',
    ];

    protected function casts(): array
    {
        return [
            'application_deadline' => 'date',
            'vacancies' => 'integer',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Employer
    |--------------------------------------------------------------------------
    */

    public function employer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'employer_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Applications
    |--------------------------------------------------------------------------
    */

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Saved Jobs
    |--------------------------------------------------------------------------
    */

    public function savedJobs(): HasMany
    {
        return $this->hasMany(SavedJob::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Job Fair Vacancies
    |--------------------------------------------------------------------------
    */

    public function jobFairVacancies(): HasMany
    {
        return $this->hasMany(JobFairVacancy::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Placement Results
    |--------------------------------------------------------------------------
    */

    public function placementResults(): HasMany
    {
        return $this->hasMany(PlacementResult::class);
    }
}