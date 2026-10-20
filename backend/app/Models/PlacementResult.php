<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlacementResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_fair_id',
        'jobseeker_id',
        'employer_id',
        'job_posting_id',
        'interview_status',
        'placement_status',
        'notes',
        'result_date',
    ];

    protected function casts(): array
    {
        return [
            'result_date' => 'date',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Job Fair
    |--------------------------------------------------------------------------
    */

    public function jobFair(): BelongsTo
    {
        return $this->belongsTo(JobFair::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Jobseeker
    |--------------------------------------------------------------------------
    */

    public function jobseeker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'jobseeker_id');
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
    | Job Posting
    |--------------------------------------------------------------------------
    */

    public function jobPosting(): BelongsTo
    {
        return $this->belongsTo(JobPosting::class);
    }
}