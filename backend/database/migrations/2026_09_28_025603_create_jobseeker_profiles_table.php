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
    Schema::create('jobseeker_profiles', function (Blueprint $table) {
        $table->id();

        $table->foreignId('user_id')
            ->unique()
            ->constrained()
            ->cascadeOnDelete();

        $table->string('phone')->nullable();
        $table->text('address')->nullable();
        $table->date('birth_date')->nullable();
        $table->string('gender')->nullable();
        $table->string('civil_status')->nullable();

        $table->string('education')->nullable();
        $table->string('course')->nullable();
        $table->string('school')->nullable();

        $table->text('skills')->nullable();
        $table->text('work_experience')->nullable();
        $table->string('preferred_job')->nullable();

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jobseeker_profiles');
    }
};
