<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])
        ->name('dashboard');

    Route::get('rekonsiliasi', [\App\Http\Controllers\RekonsiliasiBankController::class, 'index'])
        ->name('rekonsiliasi.index');
    Route::post('rekonsiliasi/fetch-data', [\App\Http\Controllers\RekonsiliasiBankController::class, 'fetchData'])
        ->name('rekonsiliasi.fetch');
    Route::post('rekonsiliasi/check-connection', [\App\Http\Controllers\RekonsiliasiBankController::class, 'checkConnection'])
        ->name('rekonsiliasi.check-connection');
    Route::post('rekonsiliasi/check-status', [\App\Http\Controllers\RekonsiliasiBankController::class, 'checkStatus'])
        ->name('rekonsiliasi.check-status');
    Route::get('rekonsiliasi/monitor-psw-t24', [\App\Http\Controllers\RekonsiliasiBankController::class, 'monitorPswToT24'])
        ->name('rekonsiliasi.monitor');
    Route::get('rekonsiliasi/mutasi-rekening', [\App\Http\Controllers\RekonsiliasiBankController::class, 'mutasiRekening'])
        ->name('rekonsiliasi.mutasi');
    Route::post('rekonsiliasi/simulator', [\App\Http\Controllers\ApiSimulatorController::class, 'simulate'])
        ->name('rekonsiliasi.simulator');

    // Admin routes
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::resource('vendors', \App\Http\Controllers\Admin\VendorController::class);
        Route::post('templates/fetch-sample', [\App\Http\Controllers\Admin\TemplateController::class, 'fetchSampleData'])
            ->name('templates.fetch-sample');
        Route::resource('templates', \App\Http\Controllers\Admin\TemplateController::class);
        Route::resource('receipt-templates', \App\Http\Controllers\Admin\ReceiptTemplateController::class);
        
        // Processor Editor Routes
        Route::post('templates/processor/get', [\App\Http\Controllers\Admin\TemplateController::class, 'getProcessorContent'])->name('templates.processor.get');
        Route::post('templates/processor/save', [\App\Http\Controllers\Admin\TemplateController::class, 'saveProcessorContent'])->name('templates.processor.save');
        Route::post('templates/processor/create', [\App\Http\Controllers\Admin\TemplateController::class, 'createProcessor'])->name('templates.processor.create');

        Route::resource('proccodes', \App\Http\Controllers\Admin\ProccodeController::class);
        
        Route::resource('users', \App\Http\Controllers\Admin\UserController::class);
        
        Route::get('logs', [\App\Http\Controllers\Admin\LogViewerController::class, 'index'])->name('logs.index');
        Route::delete('logs', [\App\Http\Controllers\Admin\LogViewerController::class, 'destroy'])->name('logs.destroy');

        Route::get('account-numbers', [\App\Http\Controllers\Admin\AccountNumberController::class, 'index'])->name('account-numbers.index');
        Route::post('account-numbers/check', [\App\Http\Controllers\Admin\AccountNumberController::class, 'check'])->name('account-numbers.check');
        
        Route::resource('districts', \App\Http\Controllers\Admin\DistrictController::class);
    });
});

require __DIR__.'/settings.php';
