
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employer_settings', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->unique()
                ->constrained('users')
                ->cascadeOnDelete();

            // Account preferences
            $table->string('preferred_contact_method')->default('email');

            // Notification preferences
            $table->boolean('notify_new_applicants')->default(true);
            $table->boolean('notify_application_updates')->default(true);
            $table->boolean('notify_job_approvals')->default(true);
            $table->boolean('notify_job_fairs')->default(true);

            // Privacy preferences
            $table->boolean('show_company_email')->default(true);
            $table->boolean('show_company_phone')->default(true);
            $table->boolean('show_company_address')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employer_settings');
    }
};
