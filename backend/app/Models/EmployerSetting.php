<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployerSetting extends Model
{
    protected $fillable = [
        'user_id',
        'preferred_contact_method',
        'notify_new_applicants',
        'notify_application_updates',
        'notify_job_approvals',
        'notify_job_fairs',
        'show_company_email',
        'show_company_phone',
        'show_company_address',
    ];

    protected function casts(): array
    {
        return [
            'notify_new_applicants' => 'boolean',
            'notify_application_updates' => 'boolean',
            'notify_job_approvals' => 'boolean',
            'notify_job_fairs' => 'boolean',
            'show_company_email' => 'boolean',
            'show_company_phone' => 'boolean',
            'show_company_address' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
