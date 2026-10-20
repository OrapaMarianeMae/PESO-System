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
    Schema::create('placement_results', function (Blueprint $table) {
        $table->id();

        $table->foreignId('job_fair_id')
            ->constrained('job_fairs')
            ->cascadeOnDelete();

        $table->foreignId('jobseeker_id')
            ->constrained('users')
            ->cascadeOnDelete();

        $table->foreignId('employer_id')
            ->constrained('users')
            ->cascadeOnDelete();

        $table->foreignId('job_posting_id')
            ->nullable()
            ->constrained('job_postings')
            ->nullOnDelete();

        $table->string('interview_status')
            ->default('not_interviewed');

        $table->string('placement_status')
            ->default('pending');

        $table->text('notes')->nullable();

        $table->date('result_date')->nullable();

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('placement_results');
    }
};
