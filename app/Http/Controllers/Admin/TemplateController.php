<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Template;
use App\Models\Vendor;
use App\Models\Proccode;
use App\Models\HeaderTemplate;
use App\Services\ApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class TemplateController extends Controller
{
    public function index()
    {
        $templates = Template::with('vendor')
            ->withCount('proccodes')
            ->orderBy('category')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/templates/index', [
            'templates' => $templates,
        ]);
    }

    private function getAvailableProcessors()
    {
        $path = app_path('Services/Rekonsiliasi/Processors');
        $files = glob($path . '/*.php');
        $processors = [];

        foreach ($files as $file) {
            $filename = basename($file, '.php');
            // Skip Interface and Generic if we want, but let's keep all except Interface
            if ($filename === 'RekonsiliasiProcessor') continue;
            
            $fullClass = "App\\Services\\Rekonsiliasi\\Processors\\{$filename}";
            $processors[] = [
                'name' => $filename,
                'class' => $fullClass,
                'is_generic' => $filename === 'GenericProcessor'
            ];
        }

        return $processors;
    }

    public function create()
    {
        $vendors = Vendor::active()->orderBy('name')->get(['id', 'name']);
        $categories = Template::distinct()->whereNotNull('category')->orderBy('category')->pluck('category');
        $processors = $this->getAvailableProcessors();
        $proccodes = Proccode::active()->orderBy('name')->get(['code', 'name', 'source']);
        $headerTemplates = HeaderTemplate::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('admin/templates/form', [
            'template' => null,
            'vendors' => $vendors,
            'categories' => $categories,
            'availableProcessors' => $processors,
            'proccodes' => $proccodes,
            'headerTemplates' => $headerTemplates,
        ]);
    }

    public function edit(Template $template)
    {
        $vendors = Vendor::active()->orderBy('name')->get(['id', 'name']);
        $categories = Template::distinct()->whereNotNull('category')->orderBy('category')->pluck('category');
        $processors = $this->getAvailableProcessors();
        $proccodes = Proccode::active()->orderBy('name')->get(['code', 'name', 'source']);
        $headerTemplates = HeaderTemplate::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('admin/templates/form', [
            'template' => $template,
            'vendors' => $vendors,
            'categories' => $categories,
            'availableProcessors' => $processors,
            'proccodes' => $proccodes,
            'headerTemplates' => $headerTemplates,
        ]);
    }
    
    public function fetchSampleData(Request $request, ApiService $apiService)
    {
        $request->validate([
            'proccode' => 'required|string',
            'source'   => 'required|string',
            'tanggal'  => 'required|date',
        ]);

        $result = $apiService->callApi(
            $request->proccode,
            $request->tanggal,
            $request->source
        );

        if (!$result['success']) {
            return response()->json($result, 400);
        }

        // Return all data for preview
        $data = $result['data']['xdatatemp'] ?? $result['data'] ?? [];
        // $sample = is_array($data) && count($data) > 0 ? $data[0] : (object)[];

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'category' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'mapping' => 'required|json',
            'description' => 'nullable|string',
            'valid_response_codes' => 'nullable|string',
            'processor_class' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['mapping'] = json_decode($validated['mapping'], true);

        Template::create($validated);

        Log::info('User: ' . auth()->user()->name . ' (ID: ' . auth()->id() . ') created Template: ' . $validated['name']);

        return redirect('/admin/templates')->with('success', 'Template berhasil ditambahkan');
    }



    public function update(Request $request, Template $template)
    {
        $validated = $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'category' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'mapping' => 'required|json',
            'description' => 'nullable|string',
            'valid_response_codes' => 'nullable|string',
            'processor_class' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $validated['mapping'] = json_decode($validated['mapping'], true);

        $template->update($validated);

        Log::info('User: ' . auth()->user()->name . ' (ID: ' . auth()->id() . ') updated Template: ' . $template->name . ' (ID: ' . $template->id . ')');

        return redirect('/admin/templates')->with('success', 'Template berhasil diupdate');
    }

    public function destroy(Template $template)
    {
        $name = $template->name;
        $template->delete();

        Log::info('User: ' . auth()->user()->name . ' (ID: ' . auth()->id() . ') deleted Template: ' . $name . ' (ID: ' . $template->id . ')');

        return redirect('/admin/templates')->with('success', 'Template berhasil dihapus');
    }
    
    public function getProcessorContent(Request $request) 
    {
        $request->validate([
            'class_name' => 'required|string'
        ]);

        $className = $request->input('class_name');
        // Extract basic class name if full namespace is provided
        $parts = explode('\\', $className);
        $filename = end($parts) . '.php';
        
        $path = app_path('Services/Rekonsiliasi/Processors/' . $filename);
        
        if (!file_exists($path)) {
            return response()->json(['success' => false, 'message' => 'File not found'], 404);
        }

        return response()->json([
            'success' => true, 
            'content' => file_get_contents($path)
        ]);
    }

    public function saveProcessorContent(Request $request)
    {
        $request->validate([
            'class_name' => 'required|string',
            'content' => 'required|string'
        ]);

        $className = $request->input('class_name');
        $parts = explode('\\', $className);
        $filename = end($parts) . '.php';
        $path = app_path('Services/Rekonsiliasi/Processors/' . $filename);

        // Security check: ensure path is within Processors directory
        if (dirname($path) !== app_path('Services/Rekonsiliasi/Processors')) {
            return response()->json(['success' => false, 'message' => 'Invalid path'], 403);
        }

        // Basic syntax check using php -l could be added here, but for now just save
        file_put_contents($path, $request->input('content'));

        return response()->json(['success' => true, 'message' => 'File saved successfully']);
    }

    public function createProcessor(Request $request)
    {
        $request->validate([
            'name' => 'required|string|alpha_dash'
        ]);

        $name = ucfirst($request->input('name')) . 'Processor';
        $path = app_path('Services/Rekonsiliasi/Processors/' . $name . '.php');

        if (file_exists($path)) {
            return response()->json(['success' => false, 'message' => 'Processor already exists'], 400);
        }

        $template = <<<PHP
<?php

namespace App\Services\Rekonsiliasi\Processors;

use Illuminate\Support\Facades\Log;

class {$name} implements RekonsiliasiProcessor
{
    public function process(array \$rawData, ?array \$config = []): array
    {
        // \$rawData constains the full API response
        // Implement your logic here
        
        \$results = [];
        
        // Example:
        // \$items = \$rawData['data'] ?? [];
        // foreach (\$items as \$item) {
        //     \$results[] = [
        //         'col1' => \$item['field1'],
        //         'col2' => \$item['field2'],
        //     ];
        // }

        return \$results;
    }
}
PHP;

        file_put_contents($path, $template);

        return response()->json([
            'success' => true, 
            'class' => "App\\Services\\Rekonsiliasi\\Processors\\{$name}",
            'name' => $name
        ]);
    }
}
