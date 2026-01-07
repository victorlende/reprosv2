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
        Schema::create('reconciliation_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proccode_id')->nullable()->constrained('proccodes')->onDelete('set null');
            $table->foreignId('email_destination_id')->constrained('email_destinations')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            // File info
            $table->string('file_path');
            $table->string('file_name');
            $table->integer('file_size')->nullable();

            // Email info
            $table->string('subject', 500);
            $table->text('body_note')->nullable();

            // Status tracking
            $table->string('status', 50)->default('pending'); // pending, sent, failed
            $table->timestamp('sent_at')->nullable();
            $table->text('error_message')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reconciliation_submissions');
    }
};
