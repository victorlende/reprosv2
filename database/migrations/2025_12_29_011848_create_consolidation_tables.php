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
        Schema::create('consolidation_batches', function (Blueprint $table) {
            $table->id();
            $table->date('upload_date'); // Tanggal sistem melakukan upload
            $table->string('source_type')->default('API'); // API or MANUAL
            
            // Relasi ke Master Data
            $table->foreignId('proccode_id')->constrained('proccodes')->onDelete('cascade');
            $table->foreignId('district_id')->constrained('districts')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // Summary Data
            $table->integer('total_items')->default(0);
            $table->decimal('total_nominal', 15, 2)->default(0);
            
            $table->timestamps();
            
            // Index untuk pencarian cepat
            $table->index(['district_id', 'proccode_id']);
        });

        Schema::create('consolidation_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('batch_id')->constrained('consolidation_batches')->onDelete('cascade');
            
            // Kolom penting untuk reporting (Matrix Pivot)
            $table->decimal('nominal', 15, 2)->default(0);
            $table->date('transaction_date'); // Tanggal transaksi asli (dari API)
            
            // Kolom JSON untuk menyimpan semua data mentah
            $table->json('raw_data')->nullable(); // Flexible Schema
            
            $table->timestamps();
            
            // Index untuk reporting range dan join
            $table->index('transaction_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consolidation_items');
        Schema::dropIfExists('consolidation_batches');
    }
};
