<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('users', function (Blueprint $table) {
        $table->id();

        // Personal information
        $table->string('first_name');
        $table->string('middle_name')->nullable();
        $table->string('surname');
        $table->string('name_extension')->nullable();

        // Account information
        $table->string('email')->unique();
        $table->timestamp('email_verified_at')->nullable();
        $table->string('password');

        // System control
        $table->enum('role', ['jobseeker', 'employer'])
            ->default('jobseeker');

        $table->string('verification_status')
            ->default('approved');

        $table->boolean('can_post_jobs')
            ->default(false);

        // Profile
        $table->string('profile_picture')->nullable();

        // Laravel
        $table->rememberToken();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
