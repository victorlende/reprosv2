<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HeaderTemplate;
use Illuminate\Http\Request;

class HeaderTemplateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $templates = HeaderTemplate::orderBy('name')->get();
        return \Inertia\Inertia::render('admin/header-templates/index', [
            'templates' => $templates
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return \Inertia\Inertia::render('admin/header-templates/form', [
            'template' => null
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'schema' => 'required|array',
            'schema.*.label' => 'required|string',
            'schema.*.type' => 'required|string|in:string,currency,date,number',
            'is_active' => 'boolean'
        ]);

        HeaderTemplate::create($validated);

        return redirect()->route('admin.header-templates.index')
            ->with('success', 'Header Template berhasil dibuat.');
    }

    /**
     * Display the specified resource.
     */
    public function show(HeaderTemplate $headerTemplate)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(HeaderTemplate $headerTemplate)
    {
        return \Inertia\Inertia::render('admin/header-templates/form', [
            'template' => $headerTemplate
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, HeaderTemplate $headerTemplate)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'schema' => 'required|array',
            'schema.*.label' => 'required|string',
            'schema.*.type' => 'required|string|in:string,currency,date,number',
            'is_active' => 'boolean'
        ]);

        $headerTemplate->update($validated);

        return redirect()->route('admin.header-templates.index')
            ->with('success', 'Header Template berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(HeaderTemplate $headerTemplate)
    {
        $headerTemplate->delete();
        return redirect()->back()->with('success', 'Template berhasil dihapus.');
    }
}
