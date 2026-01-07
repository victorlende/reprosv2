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
        // 1. Create Files Table
        Schema::create('reconciliation_submission_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reconciliation_submission_id')->constrained('reconciliation_submissions')->onDelete('cascade');
            $table->string('file_path');
            $table->string('file_name');
            $table->integer('file_size')->nullable();
            $table->timestamps();
        });

        // 2. Create Destinations Table
        Schema::create('reconciliation_submission_destinations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reconciliation_submission_id')->constrained('reconciliation_submissions')->onDelete('cascade');
            $table->foreignId('email_destination_id')->constrained('email_destinations')->onDelete('cascade');
            
            // Per-recipient status tracking
            $table->string('status', 50)->default('pending'); // pending, sent, failed
            $table->timestamp('sent_at')->nullable();
            $table->text('error_message')->nullable();
            
            $table->timestamps();
        });

        // 3. Modify Parent Table
        Schema::table('reconciliation_submissions', function (Blueprint $table) {
            // Drop columns that moved to child tables
            // Note: Data migration logic is skipped as per plan (reset/new feature)
            $table->dropForeign(['email_destination_id']);
            $table->dropColumn('email_destination_id');
            $table->dropColumn(['file_path', 'file_name', 'file_size']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Restore Parent Table Columns
        Schema::table('reconciliation_submissions', function (Blueprint $table) {
            $table->foreignId('email_destination_id')->nullable()->constrained('email_destinations')->onDelete('cascade');
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->integer('file_size')->nullable();
        });

        // 2. Drop New Tables
        Schema::dropIfExists('reconciliation_submission_destinations');
        Schema::dropIfExists('reconciliation_submission_files');
    }
};
