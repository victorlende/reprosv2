<?php

namespace App\Http\Controllers;

use App\Models\Proccode;
use App\Models\Setting;
use App\Services\ApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RekonsiliasiBankController extends Controller
{
    protected $apiService;

    public function __construct(ApiService $apiService)
    {
        $this->apiService = $apiService;
    }

    public function index()
    {
        $user = auth()->user();

        $query = Proccode::with(['template', 'receiptTemplate'])
            ->active()
            ->orderBy('category')
            ->orderBy('name');

        if ($user->district_id) {
            $query->where('district_id', $user->district_id);
        }

        $proccodes = $query->get(['id', 'code', 'name', 'description', 'source', 'category', 'template_id', 'receipt_template_id', 'receipt_config']);
        
        $maxDays = Setting::where('key', 'max_transaction_days')->value('value') ?? 7;

        return Inertia::render('rekonsiliasi/index', [
            'proccodes' => $proccodes,
            'maxTransactionDays' => (int) $maxDays
        ]);
    }

    public function fetchData(Request $request)
    {
        $request->validate([
            'proccode' => 'required|string',
            'proccode_id' => 'nullable|integer',
            'tanggal' => 'required|date_format:Y-m-d',
            'source' => 'required|string',
        ]);

        $result = $this->apiService->callApi(
            $request->proccode,
            $request->tanggal,
            $request->source
        );

        if ($result['success'] && isset($result['data'])) {
            $user = $request->user();
            Log::info("FetchData User: {$user->name} (ID: {$user->id}), Role: {$user->role}, DistrictID: " . var_export($user->district_id, true));

            // Strategy Pattern Implementation
            $proccodeModel = null;

            // Priority 1: Lookup by ID (Precise)
            if ($request->proccode_id) {
                $proccodeModel = Proccode::with('template')->find($request->proccode_id);
            }

            // Priority 2: Fallback to existing logic if ID not provided or not found
            if (!$proccodeModel) {
                 // Use LIKE because some codes in DB are comma separated e.g. "180V42,180E10"
                // We fetch all matches and then prioritize the one with a custom processor configuration.
                $proccodeModels = Proccode::where('code', 'LIKE', "%{$request->proccode}%")
                    ->where('source', $request->source)
                    ->with('template')
                    ->get();

                // Prioritize: Has Template AND Has Custom Processor Class
                $proccodeModel = $proccodeModels->first(function ($model) {
                    return $model->template && !empty($model->template->processor_class) && $model->template->processor_class !== 'App\Services\Rekonsiliasi\Processors\GenericProcessor';
                });

                // Fallback 1: Has Template (any)
                if (!$proccodeModel) {
                    $proccodeModel = $proccodeModels->first(function ($model) {
                        return $model->template;
                    });
                }

                // Fallback 2: First available match
                if (!$proccodeModel) {
                    $proccodeModel = $proccodeModels->first();
                }
            }

            $processorClass = \App\Services\Rekonsiliasi\Processors\GenericProcessor::class;
            $mappingConfig = null;

            if ($proccodeModel && $proccodeModel->template) {
                if (!empty($proccodeModel->template->processor_class) && class_exists($proccodeModel->template->processor_class)) {
                    $processorClass = $proccodeModel->template->processor_class;
                }
                $mappingConfig = $proccodeModel->template->mapping;
            }

            \Illuminate\Support\Facades\Log::info("Rekonsiliasi: Selected Processor Class: " . $processorClass);

            try {
                $processor = new $processorClass();
                if ($processor instanceof \App\Services\Rekonsiliasi\Processors\RekonsiliasiProcessor) {
                    $processedData = $processor->process($result['data'], $mappingConfig);
                    
                    // Update result data with processed data
                    // We keep the structure compatible with frontend which expects 'xdatatemp' inside or just data
                    // If processor returns array, we'll assign it to xdatatemp to match current frontend expectation (mostly)
                    // Or if it's already structured, we just pass it. 
                    // To be safe with GenericProcessor legacy, we just replace 'data'
                    
                    // However, if GenericProcessor just extracted xdatatemp, we should probably wrap it back 
                    // or let frontend handle it. 
                    // Let's assume frontend looks at response.data directly or response.xdatatemp
                    // The GenericProcessor returns the array of items.
                    
                    $result['data'] = $processedData;
                    
                    // Add meta info for frontend to know it was processed
                    $result['meta'] = [
                        'processor' => class_basename($processorClass),
                        'is_custom' => $processorClass !== \App\Services\Rekonsiliasi\Processors\GenericProcessor::class
                    ];
                }
            } catch (\Exception $e) {
                Log::error("Processor Error: " . $e->getMessage());
                // Fallback or keep original result, but maybe append error
                $result['processor_error'] = $e->getMessage();
            }
        }

        return response()->json($result);
    }

    public function checkConnection()
    {
        $result = $this->apiService->checkConnection();
        return response()->json($result);
    }

    public function checkStatus(Request $request)
    {
        $request->validate([
            'type' => 'required|string',
            'key' => 'required|string',
            'date' => 'required|string', // Date format validation optionally
        ]);

        $result = $this->apiService->checkTransactionStatus(
            $request->type,
            $request->key,
            $request->date
        );

        return response()->json($result);
    }

    public function monitorPswToT24()
    {
        return Inertia::render('rekonsiliasi/monitor-psw-t24');
    }

    public function mutasiRekening()
    {
        $vendors = \App\Models\Vendor::orderBy('name')->get();
        return Inertia::render('rekonsiliasi/mutasi-rekening', [
            'vendors' => $vendors
        ]);
    }
}
