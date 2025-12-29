<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\District;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DistrictController extends Controller
{
    public function index()
    {
        $districts = District::orderBy('name')
            ->get();

        return Inertia::render('admin/districts/index', [
            'districts' => $districts,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/districts/form', [
            'district' => null,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:districts,code',
            'branch_code' => 'nullable|string|max:50',
        ]);

        District::create($validated);

        Log::info('User: ' . auth()->user()->name . ' (ID: ' . auth()->id() . ') created District: ' . $validated['name']);

        return redirect()->route('admin.districts.index')->with('success', 'Kabupaten berhasil ditambahkan');
    }

    public function edit(District $district)
    {
        return Inertia::render('admin/districts/form', [
            'district' => $district,
        ]);
    }

    public function update(Request $request, District $district)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:districts,code,' . $district->id,
            'branch_code' => 'nullable|string|max:50',
        ]);

        $district->update($validated);

        Log::info('User: ' . auth()->user()->name . ' (ID: ' . auth()->id() . ') updated District: ' . $district->name . ' (ID: ' . $district->id . ')');

        return redirect()->route('admin.districts.index')->with('success', 'Kabupaten berhasil diupdate');
    }

    public function destroy(District $district)
    {
        $name = $district->name;
        
        // Potential check for existing usage in Users or Proccodes before delete?
        if ($district->users()->count() > 0 || $district->proccodes()->count() > 0) {
            return back()->with('error', 'Tidak bisa menghapus kabupaten yang sudah digunakan oleh User atau Proccode.');
        }

        $district->delete();

        Log::info('User: ' . auth()->user()->name . ' (ID: ' . auth()->id() . ') deleted District: ' . $name . ' (ID: ' . $district->id . ')');

        return redirect()->route('admin.districts.index')->with('success', 'Kabupaten berhasil dihapus');
    }
}
