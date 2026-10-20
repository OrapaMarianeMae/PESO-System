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
    Schema::create('employer_profiles', function (Blueprint $table) {
        $table->id();

        $table->foreignId('user_id')
            ->unique()
            ->constrained()
            ->cascadeOnDelete();

        $table->string('company_name');
        $table->text('company_address')->nullable();

        $table->string('company_phone')->nullable();
        $table->string('company_email')->nullable();

        $table->string('industry')->nullable();

        $table->text('company_description')->nullable();
        $table->string('website')->nullable();

        $table->string('contact_person')->nullable();
        $table->string('contact_position')->nullable();

        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employer_profiles');
    }
};
