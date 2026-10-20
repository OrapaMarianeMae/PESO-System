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
    Schema::create('job_fair_employers', function (Blueprint $table) {
        $table->id();

        $table->foreignId('job_fair_id')
            ->constrained('job_fairs')
            ->cascadeOnDelete();

        $table->foreignId('employer_id')
            ->constrained('users')
            ->cascadeOnDelete();

        $table->string('status')->default('pending');

        $table->timestamp('registered_at')->nullable();

        $table->timestamps();

        $table->unique(['job_fair_id', 'employer_id']);
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_fair_employers');
    }
};
