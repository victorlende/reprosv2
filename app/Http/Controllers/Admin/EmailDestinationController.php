<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmailDestination;
use App\Models\Proccode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class EmailDestinationController extends Controller
{
    public function index()
    {
        $emailDestinations = EmailDestination::with('proccode')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/email-destinations/index', [
            'emailDestinations' => $emailDestinations,
        ]);
    }

    public function create()
    {
        $proccodes = Proccode::active()
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        return Inertia::render('admin/email-destinations/form', [
            'emailDestination' => null,
            'proccodes' => $proccodes,
        ]);
    }

    public function store(Request $request)
    {
        // Convert "all" to null before validation
        $data = $request->all();
        if (isset($data['proccode_id']) && $data['proccode_id'] === 'all') {
            $data['proccode_id'] = null;
        }

        $validated = validator($data, [
            'proccode_id' => 'nullable|exists:proccodes,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ])->validate();

        $emailDestination = EmailDestination::create($validated);

        Log::info('User: ' . auth()->user()->name . ' (ID: ' . auth()->id() . ') created Email Destination: ' . $validated['name']);

        return redirect()->route('admin.email-destinations.index')->with('success', 'Email Tujuan berhasil ditambahkan');
    }

    public function edit(EmailDestination $emailDestination)
    {
        $proccodes = Proccode::active()
            ->orderBy('name')
            ->get(['id', 'name', 'code']);

        return Inertia::render('admin/email-destinations/form', [
            'emailDestination' => $emailDestination,
            'proccodes' => $proccodes,
        ]);
    }

    public function update(Request $request, EmailDestination $emailDestination)
    {
        // Convert "all" to null before validation
        $data = $request->all();
        if (isset($data['proccode_id']) && $data['proccode_id'] === 'all') {
            $data['proccode_id'] = null;
        }

        $validated = validator($data, [
            'proccode_id' => 'nullable|exists:proccodes,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email:dns|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ])->validate();

        $emailDestination->update($validated);

        Log::info('User: ' . auth()->user()->name . ' (ID: ' . auth()->id() . ') updated Email Destination: ' . $emailDestination->name . ' (ID: ' . $emailDestination->id . ')');

        return redirect()->route('admin.email-destinations.index')->with('success', 'Email Tujuan berhasil diupdate');
    }

    public function destroy(EmailDestination $emailDestination)
    {
        $name = $emailDestination->name;

        // Check if used in reconciliation submissions
        if ($emailDestination->reconciliationSubmissionDestinations()->count() > 0) {
            return back()->with('error', 'Tidak bisa menghapus Email Tujuan yang sudah digunakan dalam pengiriman.');
        }

        $emailDestination->delete();

        Log::info('User: ' . auth()->user()->name . ' (ID: ' . auth()->id() . ') deleted Email Destination: ' . $name . ' (ID: ' . $emailDestination->id . ')');

        return redirect()->route('admin.email-destinations.index')->with('success', 'Email Tujuan berhasil dihapus');
    }

    public function getByProccode(Request $request)
    {
        $proccodeId = $request->query('proccode_id');

        $destinations = EmailDestination::active()
            ->where(function ($query) use ($proccodeId) {
                $query->where('proccode_id', $proccodeId)
                      ->orWhereNull('proccode_id');
            })
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return response()->json($destinations);
    }
}
