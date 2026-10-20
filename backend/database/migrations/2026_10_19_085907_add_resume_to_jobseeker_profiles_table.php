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
        Schema::table('jobseeker_profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('jobseeker_profiles', 'resume')) {
                $table->string('resume')->nullable();
            }
        });
    }

    public function down(): void
    {
        // Keep the existing resume column.
    }
};
