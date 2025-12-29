<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class VendorController extends Controller
{
    public function index()
    {
        $vendors = Vendor::withCount('templates')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/vendors/index', [
            'vendors' => $vendors,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/vendors/form', [
            'vendor' => null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:vendors,code',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;

        Vendor::create($validated);

        Log::info('User: ' . auth()->user()->name . ' (ID: ' . auth()->id() . ') created Vendor: ' . $validated['name']);

        return redirect('/admin/vendors')->with('success', 'Vendor berhasil ditambahkan');
    }

    public function edit(Vendor $vendor)
    {
        return Inertia::render('admin/vendors/form', [
            'vendor' => $vendor,
        ]);
    }

    public function update(Request $request, Vendor $vendor)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:255|unique:vendors,code,' . $vendor->id,
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $vendor->update($validated);

        Log::info('User: ' . auth()->user()->name . ' (ID: ' . auth()->id() . ') updated Vendor: ' . $vendor->name . ' (ID: ' . $vendor->id . ')');

        return redirect('/admin/vendors')->with('success', 'Vendor berhasil diupdate');
    }

    public function destroy(Vendor $vendor)
    {
        $name = $vendor->name;
        $vendor->delete();

        Log::info('User: ' . auth()->user()->name . ' (ID: ' . auth()->id() . ') deleted Vendor: ' . $name . ' (ID: ' . $vendor->id . ')');

        return redirect('/admin/vendors')->with('success', 'Vendor berhasil dihapus');
    }
}
