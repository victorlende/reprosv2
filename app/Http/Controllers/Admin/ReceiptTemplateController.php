<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ReceiptTemplate;
use App\Models\Template;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ReceiptTemplateController extends Controller
{
    public function index(Request $request)
    {
        $query = ReceiptTemplate::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        $templates = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('admin/receipt-templates/index', [
            'templates' => $templates,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        // Fetch existing Templates to allow users to pick a "Table Template" source for sample data if needed
        // Or we can just provide a generic sample data fetcher similar to the Template form.
        $tableTemplates = Template::where('is_active', true)->select('id', 'name')->get();
        return Inertia::render('admin/receipt-templates/form', [
           'tableTemplates' => $tableTemplates
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'config' => 'required|array',
            'is_active' => 'boolean',
            'logo_left' => 'nullable|image|max:2048',
            'logo_right' => 'nullable|image|max:2048',
        ]);

        $config = $validated['config'];

        // Handle file uploads
        if ($request->hasFile('logo_left')) {
            $path = $request->file('logo_left')->store('receipt_logos', 'public');
            $config['header']['logo_left'] = '/storage/' . $path;
        }

        if ($request->hasFile('logo_right')) {
            $path = $request->file('logo_right')->store('receipt_logos', 'public');
            $config['header']['logo_right'] = '/storage/' . $path;
        }

        $receiptTemplate = ReceiptTemplate::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'config' => $config,
            'is_active' => $validated['is_active'],
        ]);

        Log::info('User: ' . auth()->user()->name . ' (ID: ' . auth()->id() . ') created ReceiptTemplate: ' . $receiptTemplate->name . ' (ID: ' . $receiptTemplate->id . ')');

        return redirect()->route('admin.receipt-templates.index')
            ->with('success', 'Receipt Template created successfully');
    }

    public function edit(ReceiptTemplate $receiptTemplate)
    {
        $tableTemplates = Template::where('is_active', true)->select('id', 'name')->get();
        return Inertia::render('admin/receipt-templates/form', [
            'template' => $receiptTemplate,
            'tableTemplates' => $tableTemplates
        ]);
    }

    public function update(Request $request, ReceiptTemplate $receiptTemplate)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'config' => 'required|array',
            'is_active' => 'boolean',
            'logo_left' => 'nullable|image|max:2048',
            'logo_right' => 'nullable|image|max:2048',
        ]);

        $config = $validated['config'];
        $currentConfig = $receiptTemplate->config; // Get existing config to preserve old logos if not updated

        // Handle file uploads
        if ($request->hasFile('logo_left')) {
            $path = $request->file('logo_left')->store('receipt_logos', 'public');
            $config['header']['logo_left'] = '/storage/' . $path;
        } else {
             // Preserve existing logo if not replaced (frontend sends null if not changed, but we also rely on config state)
             // Ideally frontend keeps the URL in 'config' and we just check if a new file is uploaded.
             // If a file is uploaded, we overwrite. If not, we keep what's in 'config' (which comes from frontend state).
             // However, PHP receives the 'config' array from the request. If the frontend kept the URL there, we are good.
        }

        if ($request->hasFile('logo_right')) {
            $path = $request->file('logo_right')->store('receipt_logos', 'public');
            $config['header']['logo_right'] = '/storage/' . $path;
        }

        $receiptTemplate->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'config' => $config,
            'is_active' => $validated['is_active'],
        ]);

        Log::info('User: ' . auth()->user()->name . ' (ID: ' . auth()->id() . ') updated ReceiptTemplate: ' . $receiptTemplate->name . ' (ID: ' . $receiptTemplate->id . ')');

        return redirect()->route('admin.receipt-templates.index')
            ->with('success', 'Receipt Template updated successfully');
    }

    public function destroy(ReceiptTemplate $receiptTemplate)
    {
        $name = $receiptTemplate->name;
        $receiptTemplate->delete();

        Log::info('User: ' . auth()->user()->name . ' (ID: ' . auth()->id() . ') deleted ReceiptTemplate: ' . $name . ' (ID: ' . $receiptTemplate->id . ')');

        return redirect()->back()->with('success', 'Receipt Template deleted successfully');
    }

    // Helper to fetch sample data for preview, reusing the logic from TemplateController if possible
    // For now, we expect the frontend to handle sample data fetching via the existing /admin/templates/fetch-sample endpoint
    // by passing a Vendor/Proccode ID.
}
