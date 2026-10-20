<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobFairJobseeker extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_fair_id',
        'jobseeker_id',
        'status',
        'registered_at',
        'attended_at',
    ];

    protected function casts(): array
    {
        return [
            'registered_at' => 'datetime',
            'attended_at' => 'datetime',
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
}