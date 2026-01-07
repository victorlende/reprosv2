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
        Schema::table('reconciliation_submissions', function (Blueprint $table) {
            $table->date('transaction_date_start')->nullable()->after('subject');
            $table->date('transaction_date_end')->nullable()->after('transaction_date_start');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reconciliation_submissions', function (Blueprint $table) {
            $table->dropColumn(['transaction_date_start', 'transaction_date_end']);
        });
    }
};
