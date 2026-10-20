<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationPreference extends Model
{
    protected $fillable = [
        'user_id',
        'job_alerts',
        'application_updates',
        'peso_announcements',
    ];

    protected function casts(): array
    {
        return [
            'job_alerts' => 'boolean',
            'application_updates' => 'boolean',
            'peso_announcements' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
