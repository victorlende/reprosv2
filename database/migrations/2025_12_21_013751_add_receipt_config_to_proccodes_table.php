<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('proccodes', function (Blueprint $table) {
            $table->json('receipt_config')->nullable()->after('receipt_template_id');
        });
    }

    public function down(): void
    {
        Schema::table('proccodes', function (Blueprint $table) {
            $table->dropColumn('receipt_config');
        });
    }
};
