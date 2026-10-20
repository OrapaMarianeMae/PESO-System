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
    Schema::create('job_postings', function (Blueprint $table) {
        $table->id();

        $table->foreignId('employer_id')
            ->constrained('users')
            ->cascadeOnDelete();

        $table->string('job_title');
        $table->text('description')->nullable();

        $table->string('location')->nullable();
        $table->string('employment_type')->nullable();
        $table->string('industry')->nullable();

        $table->string('salary')->nullable();

        $table->text('requirements')->nullable();
        $table->text('skills')->nullable();

        $table->unsignedInteger('vacancies')->default(1);

        $table->date('application_deadline')->nullable();

        $table->string('status')->default('pending');

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_postings');
    }
};
