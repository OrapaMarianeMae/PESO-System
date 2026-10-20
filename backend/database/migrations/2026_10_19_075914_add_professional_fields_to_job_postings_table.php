
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_postings', function (Blueprint $table) {
            $table->string('educational_attainment')->nullable();
            $table->string('work_experience')->nullable();
            $table->string('work_arrangement')->nullable();
            $table->string('salary_period')->nullable();
            $table->text('benefits')->nullable();
            $table->text('application_instructions')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('job_postings', function (Blueprint $table) {
            $table->dropColumn([
                'educational_attainment',
                'work_experience',
                'work_arrangement',
                'salary_period',
                'benefits',
                'application_instructions',
            ]);
        });
    }
};
