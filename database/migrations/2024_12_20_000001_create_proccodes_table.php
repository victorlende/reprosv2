<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proccodes', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // Contoh: 180V82,180G12
            $table->string('name'); // Contoh: PBB Kabupaten Kupang
            $table->string('description')->nullable(); // Deskripsi tambahan
            $table->string('source'); // Source/PSW yang digunakan (psw1, psw2, dll)
            $table->string('category')->nullable(); // Kategori: PBB, Pajak Air, dll
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proccodes');
    }
};
