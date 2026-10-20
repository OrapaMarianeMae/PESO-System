<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@peso-danao.gov.ph'],
            [
                'first_name' => 'PESO',
                'middle_name' => null,
                'surname' => 'Administrator',
                'name_extension' => null,
                'password' => Hash::make('AdminPESO2026!'),
                'role' => 'admin',
                'verification_status' => 'approved',
                'can_post_jobs' => false,
                'email_verified_at' => now(),
            ]
        );
    }
}
