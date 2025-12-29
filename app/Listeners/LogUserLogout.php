<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

class LogUserLogout
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
    public function handle(Logout $event): void
    {
        if ($event->user) {
            $user = $event->user;
            $ip = $this->request->ip();
            $userAgent = $this->request->userAgent();

            Log::info("User Logout: {$user->name} (ID: {$user->id})", [
                'ip' => $ip,
                'user_agent' => $userAgent,
                'email' => $user->email,
            ]);
        }
    }
}
