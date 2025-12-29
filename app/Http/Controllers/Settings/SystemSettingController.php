<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Inertia\Inertia;
use Illuminate\Http\Request; // Redundant if already imported, check. Line 6 has it.

class SystemSettingController extends Controller
{
    public function index()
    {
        return Inertia::render('settings/system', [
            'max_transaction_days' => Setting::where('key', 'max_transaction_days')->value('value') ?? 7,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'max_transaction_days' => 'required|integer|min:1|max:30',
        ]);

        Setting::updateOrCreate(
            ['key' => 'max_transaction_days'],
            ['value' => $request->max_transaction_days]
        );

        return back();
    }
}
