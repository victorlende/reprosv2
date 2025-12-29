<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

class LogUserLogin
{
    /**
     * Create the event listener.
     */
    public function __construct(public Request $request)
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(Login $event): void
    {
        $user = $event->user;
        $ip = $this->request->ip();
        $userAgent = $this->request->userAgent();

        Log::info("User Login: {$user->name} (ID: {$user->id})", [
            'ip' => $ip,
            'user_agent' => $userAgent,
            'email' => $user->email,
        ]);
    }
}
