<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountNumberController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/account-numbers/index');
    }

    public function check(Request $request)
    {
        $request->validate([
            'account_numbers' => 'required|array|min:1|max:10',
            'account_numbers.*' => 'required|string|distinct',
        ]);

        // Mock API call - User said they are preparing the API.
        // For now, we return mock data based on input.
        $results = collect($request->account_numbers)->map(function ($acc) {
            // Simulate random status
            $exists = rand(0, 1) === 1;
            return [
                'account_number' => $acc,
                'owner_name' => $exists ? 'John Doe ' . substr($acc, -3) : '-',
                'status' => $exists ? 'Active' : 'Not Found',
                'balance' => $exists ? rand(1000000, 100000000) : 0, // Extra field just in case
            ];
        });

        return response()->json($results);
    }
}
