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
    Schema::create('job_fairs', function (Blueprint $table) {
        $table->id();

        $table->string('title');
        $table->text('description')->nullable();

        $table->string('venue');

        $table->dateTime('start_date');
        $table->dateTime('end_date');

        $table->dateTime('registration_start')->nullable();
        $table->dateTime('registration_end')->nullable();

        $table->string('status')->default('draft');

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_fairs');
    }
};
