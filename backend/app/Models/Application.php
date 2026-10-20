<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Application extends Model
{
    use HasFactory;

    protected $fillable = [
        'jobseeker_id',
        'job_posting_id',
        'status',
        'cover_letter',
        'applied_at',
        'reviewed_at',
        'interview_date',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'applied_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'interview_date' => 'datetime',
        ];
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
    | Job Posting
    |--------------------------------------------------------------------------
    */

    public function jobPosting(): BelongsTo
    {
        return $this->belongsTo(JobPosting::class);
    }
}