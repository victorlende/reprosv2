<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class LogViewerController extends Controller
{
    public function index(Request $request)
    {
        $logPath = storage_path('logs/laravel.log');
        $logs = [];

        if (File::exists($logPath)) {
            $fileContent = File::get($logPath);
            // Split by new lines, but handle the case where a log entry spans multiple lines ideally
            // For simplicity, we'll try to split by the date pattern log start
            // Pattern: [2024-01-01 12:00:00] Env.Level: Message
            
            preg_match_all('/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] (\w+)\.(\w+): (.*)/m', $fileContent, $matches, PREG_SET_ORDER);
            
            foreach (array_reverse($matches) as $match) {
                // Limit to 500 entries to prevent memory issues
                if (count($logs) >= 500) break;

                $logs[] = [
                    'timestamp' => $match[1],
                    'environment' => $match[2],
                    'level' => strtolower($match[3]),
                    'message' => $match[4],
                ];
            }
        }

        return Inertia::render('admin/logs/index', [
            'logs' => $logs,
        ]);
    }

    public function destroy()
    {
        $logPath = storage_path('logs/laravel.log');
        
        if (File::exists($logPath)) {
            File::put($logPath, '');
            Log::info('User: ' . auth()->user()->name . ' (ID: ' . auth()->id() . ') cleared the system log file.');
        }

        return redirect()->back()->with('success', 'Log file cleared successfully.');
    }
}
