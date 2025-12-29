<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\District;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
        }

        $users = $query->with('district')->latest()->paginate(10)->withQueryString();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/users/form', [
            'districts' => District::orderBy('name')->get(['id', 'name', 'code'])
        ]);
    }

    public function store(Request $request)
    {
        $currentUser = $request->user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => ['required', Rule::in(['super_user', 'admin', 'user_rekon', 'viewer', 'kantor_cabang'])],
            'accessible_menus' => 'nullable|array',
            'district_id' => 'nullable|exists:districts,id|required_if:role,kantor_cabang',
        ]);

        // Role Hierarchy Enforcement
        if ($currentUser->role !== 'super_user') {
            // Check if user has permission to manage users
            $accessibleMenus = $currentUser->accessible_menus ?? [];
            if (!in_array('admin.users', $accessibleMenus)) {
                abort(403, 'Anda tidak memiliki akses untuk menambah user.');
            }

            // Admin can only create 'user_rekon', 'viewer', or 'kantor_cabang'
            if (!in_array($validated['role'], ['user_rekon', 'viewer', 'kantor_cabang'])) {
                 abort(403, 'Anda tidak memiliki hak akses untuk membuat role ini.');
            }

            // Admin cannot grant accessible_menus
            $validated['accessible_menus'] = [];
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'accessible_menus' => $validated['accessible_menus'] ?? [],
            'district_id' => ($validated['role'] === 'kantor_cabang') ? ($validated['district_id'] ?? null) : null,
        ]);

        Log::info("User {$currentUser->name} created user {$user->name} with role {$user->role}");

        return redirect()->route('admin.users.index')->with('success', 'User created successfully.');
    }

    public function edit(User $user)
    {
        return Inertia::render('admin/users/form', [
            'user' => $user,
            'districts' => District::orderBy('name')->get(['id', 'name', 'code'])
        ]);
    }

    public function update(Request $request, User $user)
    {
        $currentUser = $request->user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8|confirmed',
            'role' => ['required', Rule::in(['super_user', 'admin', 'user_rekon', 'viewer', 'kantor_cabang'])],
            'accessible_menus' => 'nullable|array',
            'district_id' => 'nullable|exists:districts,id|required_if:role,kantor_cabang',
        ]);

        // Role Hierarchy Enforcement for Update
        if ($currentUser->role !== 'super_user') {
             // Check permission
             $accessibleMenus = $currentUser->accessible_menus ?? [];
             if (!in_array('admin.users', $accessibleMenus)) {
                 abort(403, 'Anda tidak memiliki akses untuk mengubah user.');
             }

             // Cannot modify Super User
             if ($user->role === 'super_user') {
                  abort(403, 'Anda tidak dapat mengubah Super User.');
             }
             // Cannot modify other Admins
             if ($user->role === 'admin' && $user->id !== $currentUser->id) {
                  abort(403, 'Anda tidak dapat mengubah sesama Admin.');
             }
             
             // Cannot assign prohibited roles (super_user or admin)
             // Even if editing self, maybe allow keeping 'admin' but not promoting to 'super_user'
             if ($user->id === $currentUser->id) {
                 if ($validated['role'] !== $user->role) {
                     abort(403, 'Anda tidak dapat mengubah role anda sendiri.');
                 }
                 
                 // Compare permission arrays
                 $requestMenus = $validated['accessible_menus'] ?? [];
                 $currentMenus = $user->accessible_menus ?? [];
                 
                 // Sort arrays to ensure order doesn't affect comparison
                 sort($requestMenus);
                 sort($currentMenus);
                 
                 if ($requestMenus !== $currentMenus) {
                     abort(403, 'Anda tidak dapat mengubah hak akses anda sendiri.');
                 }
             } else {
                 if (!in_array($validated['role'], ['user_rekon', 'viewer', 'kantor_cabang'])) {
                    abort(403, 'Anda hanya dapat memberikan role User Rekon, Viewer, atau Kantor Cabang.');
                 }

                 // Admin cannot grant ANY accessible_menus to others
                 // Force empty array if not Super User
                 $validated['accessible_menus'] = [];
             }
        }

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'accessible_menus' => $validated['accessible_menus'] ?? [],
            'district_id' => ($validated['role'] === 'kantor_cabang') ? ($validated['district_id'] ?? null) : null,
        ];

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        Log::info("User {$currentUser->name} updated user {$user->name}");

        return redirect()->route('admin.users.index')->with('success', 'User updated successfully.');
    }

    public function destroy(Request $request, User $user)
    {
        $currentUser = $request->user();

        if ($user->id === $currentUser->id) {
            return back()->with('error', 'Cannot delete yourself.');
        }

        if ($currentUser->role !== 'super_user') {
            $accessibleMenus = $currentUser->accessible_menus ?? [];
            if (!in_array('admin.users', $accessibleMenus)) {
                abort(403, 'Anda tidak memiliki akses untuk menghapus user.');
            }

            if ($user->role === 'super_user') {
                abort(403, 'Cannot delete Super User.');
            }
        }

        $user->delete();
        
        Log::info("User {$currentUser->name} deleted user {$user->name}");

        return back()->with('success', 'User deleted successfully.');
    }
}
