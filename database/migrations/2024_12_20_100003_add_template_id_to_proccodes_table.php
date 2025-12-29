<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('proccodes', function (Blueprint $table) {
            $table->foreignId('template_id')->nullable()->after('source')->constrained()->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('proccodes', function (Blueprint $table) {
            $table->dropForeign(['template_id']);
            $table->dropColumn('template_id');
        });
    }
};
