<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobFairVacancy extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_fair_id',
        'job_posting_id',
        'vacancies_offered',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'vacancies_offered' => 'integer',
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
    | Job Posting
    |--------------------------------------------------------------------------
    */

    public function jobPosting(): BelongsTo
    {
        return $this->belongsTo(JobPosting::class);
    }
}