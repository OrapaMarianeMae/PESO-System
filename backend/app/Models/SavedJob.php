<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SavedJob extends Model
{
    use HasFactory;

    protected $fillable = [
        'jobseeker_id',
        'job_posting_id',
    ];

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