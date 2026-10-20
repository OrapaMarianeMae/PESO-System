<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobFairEmployer extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_fair_id',
        'employer_id',
        'status',
        'registered_at',
    ];

    protected function casts(): array
    {
        return [
            'registered_at' => 'datetime',
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
    | Employer
    |--------------------------------------------------------------------------
    */

    public function employer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'employer_id');
    }
}