<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Proccode;
use App\Models\Template;
use App\Models\ReceiptTemplate;
use App\Models\District;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProccodeController extends Controller
{
    public function index()
    {
        $proccodes = Proccode::with('template.vendor')
            ->orderBy('category')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/proccodes/index', [
            'proccodes' => $proccodes,
        ]);
    }

    public function create()
    {
        $templates = Template::with('vendor')
            ->active()
            ->orderBy('category')
            ->orderBy('name')
            ->get(['id', 'vendor_id', 'category', 'name']);
        
        $categories = Proccode::distinct()->whereNotNull('category')->orderBy('category')->pluck('category');

        $receiptTemplates = ReceiptTemplate::where('is_active', true)->orderBy('name')->get(['id', 'name']);
        $districts = District::orderBy('name')->get(['id', 'name', 'code']);

        return Inertia::render('admin/proccodes/form', [
            'proccode' => null,
            'templates' => $templates,
            'receiptTemplates' => $receiptTemplates,
            'categories' => $categories,
            'districts' => $districts,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'source' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'template_id' => 'nullable|exists:templates,id',
            'receipt_template_id' => 'nullable|exists:receipt_templates,id',
            'district_id' => 'nullable|exists:districts,id',
            'is_active' => 'boolean',
            'receipt_header_title' => 'nullable|string',
            'receipt_header_subtitle' => 'nullable|string',
            'receipt_header_address' => 'nullable|string',
            'logo_left' => 'nullable|image|max:1024',
            'logo_right' => 'nullable|image|max:1024',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;

        $receiptConfig = [
            'title' => $request->input('receipt_header_title'),
            'subtitle' => $request->input('receipt_header_subtitle'),
            'address' => $request->input('receipt_header_address'),
            'logo_left' => null,
            'logo_right' => null,
        ];

        if ($request->hasFile('logo_left')) {
            $path = $request->file('logo_left')->store('receipt_headers', 'public');
            $receiptConfig['logo_left'] = '/storage/' . $path;
        }

        if ($request->hasFile('logo_right')) {
            $path = $request->file('logo_right')->store('receipt_headers', 'public');
            $receiptConfig['logo_right'] = '/storage/' . $path;
        }

        $validated['receipt_config'] = $receiptConfig;
        unset($validated['receipt_header_title'], $validated['receipt_header_subtitle'], $validated['receipt_header_address'], $validated['logo_left'], $validated['logo_right']);

        Proccode::create($validated);

        Log::info('User: ' . auth()->user()->name . ' (ID: ' . auth()->id() . ') created Proccode: ' . $validated['name'] . ' (' . $validated['code'] . ')');

        return redirect('/admin/proccodes')->with('success', 'Proccode berhasil ditambahkan');
    }

    public function edit(Proccode $proccode)
    {
        $templates = Template::with('vendor')
            ->active()
            ->orderBy('category')
            ->orderBy('name')
            ->get(['id', 'vendor_id', 'category', 'name']);

        $categories = Proccode::distinct()->whereNotNull('category')->orderBy('category')->pluck('category');

        $receiptTemplates = ReceiptTemplate::where('is_active', true)->orderBy('name')->get(['id', 'name']);
        $districts = District::orderBy('name')->get(['id', 'name', 'code']);

        return Inertia::render('admin/proccodes/form', [
            'proccode' => $proccode,
            'templates' => $templates,
            'receiptTemplates' => $receiptTemplates,
            'categories' => $categories,
            'districts' => $districts,
        ]);
    }

    public function update(Request $request, Proccode $proccode)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'source' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'template_id' => 'nullable|exists:templates,id',
            'receipt_template_id' => 'nullable|exists:receipt_templates,id',
            'district_id' => 'nullable|exists:districts,id',
            'is_active' => 'boolean',
            'receipt_header_title' => 'nullable|string',
            'receipt_header_subtitle' => 'nullable|string',
            'receipt_header_address' => 'nullable|string',
            'logo_left' => 'nullable|image|max:1024',
            'logo_right' => 'nullable|image|max:1024',
        ]);

        $currentConfig = $proccode->receipt_config ?? [];
        $receiptConfig = [
            'title' => $request->input('receipt_header_title'),
            'subtitle' => $request->input('receipt_header_subtitle'),
            'address' => $request->input('receipt_header_address'),
            'logo_left' => $currentConfig['logo_left'] ?? null,
            'logo_right' => $currentConfig['logo_right'] ?? null,
        ];

        if ($request->hasFile('logo_left')) {
            $path = $request->file('logo_left')->store('receipt_headers', 'public');
            $receiptConfig['logo_left'] = '/storage/' . $path;
        }

        if ($request->hasFile('logo_right')) {
            $path = $request->file('logo_right')->store('receipt_headers', 'public');
            $receiptConfig['logo_right'] = '/storage/' . $path;
        }

        $validated['receipt_config'] = $receiptConfig;
        unset($validated['receipt_header_title'], $validated['receipt_header_subtitle'], $validated['receipt_header_address'], $validated['logo_left'], $validated['logo_right']);

        $proccode->update($validated);

        Log::info('User: ' . auth()->user()->name . ' (ID: ' . auth()->id() . ') updated Proccode: ' . $proccode->name . ' (ID: ' . $proccode->id . ')');

        return redirect('/admin/proccodes')->with('success', 'Proccode berhasil diupdate');
    }

    public function destroy(Proccode $proccode)
    {
        $name = $proccode->name;
        $proccode->delete();

        Log::info('User: ' . auth()->user()->name . ' (ID: ' . auth()->id() . ') deleted Proccode: ' . $name . ' (ID: ' . $proccode->id . ')');

        return redirect('/admin/proccodes')->with('success', 'Proccode berhasil dihapus');
    }
}
