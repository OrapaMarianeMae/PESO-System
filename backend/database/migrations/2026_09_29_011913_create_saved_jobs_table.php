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
    Schema::create('saved_jobs', function (Blueprint $table) {
        $table->id();

        $table->foreignId('jobseeker_id')
            ->constrained('users')
            ->cascadeOnDelete();

        $table->foreignId('job_posting_id')
            ->constrained('job_postings')
            ->cascadeOnDelete();

        $table->timestamps();

        $table->unique(['jobseeker_id', 'job_posting_id']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saved_jobs');
    }
};
