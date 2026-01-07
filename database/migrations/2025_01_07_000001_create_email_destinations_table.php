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
        Schema::create('email_destinations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proccode_id')->nullable()->constrained('proccodes')->onDelete('set null');
            $table->string('name'); // Nama tujuan (misal: "CIMB Niaga", "Kabupaten Bandung")
            $table->string('email');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_destinations');
    }
};
