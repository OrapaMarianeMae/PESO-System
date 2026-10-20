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
    Schema::create('job_fair_vacancies', function (Blueprint $table) {
        $table->id();

        $table->foreignId('job_fair_id')
            ->constrained('job_fairs')
            ->cascadeOnDelete();

        $table->foreignId('job_posting_id')
            ->constrained('job_postings')
            ->cascadeOnDelete();

        $table->unsignedInteger('vacancies_offered')->default(1);

        $table->string('status')->default('active');

        $table->timestamps();

        $table->unique(['job_fair_id', 'job_posting_id']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_fair_vacancies');
    }
};
