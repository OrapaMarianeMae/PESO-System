<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployerProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company_name',
        'company_address',
        'company_phone',
        'company_email',
        'industry',
        'company_description',
        'website',
        'contact_person',
        'contact_position',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}