<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleMenuAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $menuKey = null): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        if ($user->role === 'super_user') {
            return $next($request);
        }

        // If no specific menu key is required, just check if they have a role at all?
        // Actually, we usually apply this middleware with a parameter: middleware('menu:admin.vendors')
        
        if ($menuKey) {
            $accessibleMenus = $user->accessible_menus ?? [];
            
            // Check if the exact menu key is in their list, OR if they have the parent group (e.g. 'admin' access grants 'admin.*'?)
            // For strict RBAC as requested: "super user can determine what menu user can access".
            // So we check for exact match.
            
            // Allow if 'admin' parent is checked and we are accessing 'admin.vendors'? 
            // Or assume flat list of keys. Let's assume flat list of keys for simplicity in the beginning,
            // or the list contains the specific leaf nodes.
            
            if (!in_array($menuKey, $accessibleMenus)) {
                // Check if they have the parent key?
                // Example: 'admin' key might give access to all admin routes? 
                // Let's implement strict check first.
                
                // If the user has 'admin' (the group), maybe they should access everything under it?
                // For now, let's stick to explicit permissions.
                
                // Special case: 'dashboard' usually everyone has it, but let's enforce it too if needed.
                
                abort(403, 'Unauthorized access to this menu.');
            }
        }

        return $next($request);
    }
}
