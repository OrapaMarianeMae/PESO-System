<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobFair extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'venue',
        'start_date',
        'end_date',
        'registration_start',
        'registration_end',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'datetime',
            'end_date' => 'datetime',
            'registration_start' => 'datetime',
            'registration_end' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Employer Registrations
    |--------------------------------------------------------------------------
    */

    public function employerRegistrations(): HasMany
    {
        return $this->hasMany(JobFairEmployer::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Job Fair Vacancies
    |--------------------------------------------------------------------------
    */

    public function vacancies(): HasMany
    {
        return $this->hasMany(JobFairVacancy::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Jobseeker Registrations
    |--------------------------------------------------------------------------
    */

    public function jobseekerRegistrations(): HasMany
    {
        return $this->hasMany(JobFairJobseeker::class);
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