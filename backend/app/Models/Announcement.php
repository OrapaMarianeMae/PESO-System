<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'visibility',
        'status',
        'publish_at',
    ];

    protected function casts(): array
    {
        return [
            'publish_at' => 'datetime',
        ];
    }
}