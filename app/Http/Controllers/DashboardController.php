<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Display the dashboard.
     */
    public function index(): Response
    {
        $activeSessions = DB::table('sessions')
            ->join('users', 'sessions.user_id', '=', 'users.id')
            ->whereNotNull('sessions.user_id')
            ->select(
                'users.name',
                'users.email',
                'sessions.ip_address',
                'sessions.last_activity'
            )
            ->orderBy('sessions.last_activity', 'desc')
            ->get()
            ->map(function ($session) {
                return [
                    'name' => $session->name,
                    'email' => $session->email,
                    'ip_address' => $session->ip_address,
                    'last_activity' => Carbon::createFromTimestamp($session->last_activity)->diffForHumans(),
                    'last_activity_raw' => $session->last_activity,
                ];
            });

        // Fetch available services (Proccodes) for the dashboard catalog
        $services = \App\Models\Proccode::active()
            ->orderBy('category')
            ->orderBy('name')
            ->get(['code', 'name', 'description', 'category', 'source'])
            ->groupBy('category');

        return Inertia::render('dashboard', [
            'activeUsers' => $activeSessions,
            'services' => $services,
        ]);
    }
}
