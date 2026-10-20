<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
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
    | Event Registrations
    |--------------------------------------------------------------------------
    */

    public function registrations(): HasMany
    {
        return $this->hasMany(EventRegistration::class);
    }
}