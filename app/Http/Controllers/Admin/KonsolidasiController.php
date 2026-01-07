<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ConsolidationBatch;
use App\Models\ConsolidationItem;
use App\Models\District;
use App\Models\Proccode;
use App\Services\ApiService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class KonsolidasiController extends Controller
{
    protected $apiService;

    public function __construct(ApiService $apiService)
    {
        $this->apiService = $apiService;
    }

    public function index()
    {
        // Matrix Aggregation Logic
        // We need to pivot: Rows = Districts, Columns = Proccodes (Categories)
        
        $districts = District::orderBy('name')->get();
        // Get proccodes that are actually used in batches
        $usedProccodeIds = ConsolidationBatch::distinct()->pluck('proccode_id');
        $proccodes = Proccode::whereIn('id', $usedProccodeIds)->orderBy('name')->get();

        // Aggregate Data
        $data = DB::table('consolidation_batches as b')
            ->join('consolidation_items as i', 'b.id', '=', 'i.batch_id')
            ->select(
                'b.district_id',
                'b.proccode_id',
                DB::raw('COUNT(i.id) as total_trx'),
                DB::raw('SUM(i.nominal) as total_nominal')
            )
            ->groupBy('b.district_id', 'b.proccode_id')
            ->get();

        // Transform collection to keyed array for easier frontend lookup {district_id}_{proccode_id}
        $matrix = [];
        foreach ($data as $row) {
            $key = "{$row->district_id}_{$row->proccode_id}";
            $matrix[$key] = [
                'trx' => $row->total_trx,
                'nominal' => $row->total_nominal
            ];
        }

        return Inertia::render('admin/konsolidasi/index', [
            'districts' => $districts,
            'proccodes' => $proccodes,
            'matrix' => $matrix,
            'last_update' => ConsolidationBatch::max('updated_at'),
        ]);
    }

    public function export()
    {
        $districts = District::orderBy('name')->get();
        // Get all proccodes used in batches BUT also active ones to ensure matrix is consistent if needed. 
        // For strict report consistency, stick to used ones or all active. Let's use logic from index.
        $usedProccodeIds = ConsolidationBatch::distinct()->pluck('proccode_id');
        $proccodes = Proccode::whereIn('id', $usedProccodeIds)->orderBy('name')->get();

        $data = DB::table('consolidation_batches as b')
            ->join('consolidation_items as i', 'b.id', '=', 'i.batch_id')
            ->select(
                'b.district_id',
                'b.proccode_id',
                DB::raw('COUNT(i.id) as total_trx'),
                DB::raw('SUM(i.nominal) as total_nominal')
            )
            ->groupBy('b.district_id', 'b.proccode_id')
            ->get();

        $matrix = [];
        foreach ($data as $row) {
            $key = "{$row->district_id}_{$row->proccode_id}";
            $matrix[$key] = [
                'trx' => $row->total_trx,
                'nominal' => $row->total_nominal
            ];
        }

        return response()->view('admin.konsolidasi.export', [
            'districts' => $districts,
            'proccodes' => $proccodes,
            'matrix' => $matrix,
        ])->header('Content-Type', 'application/vnd.ms-excel')
          ->header('Content-Disposition', 'attachment; filename="Laporan_Konsolidasi_' . date('d_m_Y') . '.xls"');
    }

    public function create()
    {
        $districts = District::orderBy('name')->get(['id', 'name']);
        $proccodes = Proccode::active()->whereNotNull('template_id')->orderBy('name')->get(['id', 'code', 'name', 'source', 'template_id']);

        return Inertia::render('admin/konsolidasi/create', [
            'districts' => $districts,
            'proccodes' => $proccodes,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'district_id' => 'required|exists:districts,id',
            'proccode_id' => 'required|exists:proccodes,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $districtId = $request->district_id;
        $proccodeId = $request->proccode_id;
        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);
        
        $proccode = Proccode::with('template')->findOrFail($proccodeId);
        
        try {
            DB::beginTransaction();

            // 1. Fetch & Parse Data
            $result = $this->fetchAndParseData($proccode, $startDate, $endDate);
            $parsedItems = $result['items'];

            if (empty($parsedItems)) {
                throw new \Exception("Tidak ada data ditemukan dalam rentang tanggal tersebut.");
            }

            // 2. Smart Replace Logic (Deduplication)
            $existingBatchIds = ConsolidationBatch::where('district_id', $districtId)
                ->where('proccode_id', $proccodeId)
                ->pluck('id');

            if ($existingBatchIds->isNotEmpty()) {
                ConsolidationItem::whereIn('batch_id', $existingBatchIds)
                    ->whereBetween('transaction_date', [$startDate->format('Y-m-d'), $endDate->format('Y-m-d')])
                    ->delete();
            }

            // 3. Create New Batch
            $batch = ConsolidationBatch::create([
                'upload_date' => now(),
                'source_type' => 'API',
                'proccode_id' => $proccodeId,
                'district_id' => $districtId,
                'user_id' => auth()->id(),
                'total_items' => count($parsedItems),
                'total_nominal' => collect($parsedItems)->sum('nominal'),
            ]);

            // 4. Save Items
            foreach ($parsedItems as $item) {
                ConsolidationItem::create([
                    'batch_id' => $batch->id,
                    'transaction_date' => $item['transaction_date'],
                    'nominal' => $item['nominal'],
                    'raw_data' => $item['raw_data']
                ]);
            }

            DB::commit();

            return redirect()->route('admin.konsolidasi.index')
                ->with('success', "Berhasil menarik " . count($parsedItems) . " data ($startDate - $endDate).");

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Konsolidasi Failed: " . $e->getMessage());
            return back()->with('error', 'Gagal memproses data: ' . $e->getMessage());
        }
    }

    public function preview(Request $request)
    {
        $request->validate([
            'proccode_id' => 'required|exists:proccodes,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $proccodeId = $request->proccode_id;
        $startDate = Carbon::parse($request->start_date);
        $endDate = Carbon::parse($request->end_date);
        
        $proccode = Proccode::with('template')->findOrFail($proccodeId);

        try {
            $result = $this->fetchAndParseData($proccode, $startDate, $endDate);
            
            return response()->json([
                'success' => true,
                'data' => $result['items'],
                'headers' => $result['headers'], // Return dynamic headers
                'summary' => [
                    'total_items' => count($result['items']),
                    'total_nominal' => collect($result['items'])->sum('nominal')
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function fetchAndParseData($proccode, $startDate, $endDate)
    {
        // 1. Fetch Data per Date in Range
        $allData = [];
        $currentDate = $startDate->copy();
        
        while ($currentDate->lte($endDate)) {
            $dateStr = $currentDate->format('Y-m-d');
            $result = $this->apiService->callApi($proccode->code, $dateStr, $proccode->source);
            
            if ($result['success']) {
                $items = $result['data']['xdatatemp'] ?? $result['data'] ?? [];
                if (is_array($items)) {
                    foreach ($items as $item) {
                        $allData[] = [
                            'date' => $dateStr,
                            'raw' => $item
                        ];
                    }
                }
            }
            
            $currentDate->addDay();
        }

        // 2. Parse Items & Prepare Headers
        $parsedItems = [];
        $headers = [];

        // Define Headers based on template
        if ($proccode->template && !empty($proccode->template->mapping['table_columns'])) {
            foreach ($proccode->template->mapping['table_columns'] as $col) {
                $headers[] = [
                    'key' => strtolower(str_replace(' ', '_', $col['label'])), // normalized key
                    'label' => $col['label'],
                    'path' => $col['path'],
                    'type' => $col['type']
                ];
            }
        } else {
            // Default headers if no template
            $headers = [
                ['key' => 'transaction_date', 'label' => 'Tanggal', 'path' => 'date', 'type' => 'date'],
                ['key' => 'nominal', 'label' => 'Nominal', 'path' => 'nominal', 'type' => 'currency'],
            ];
        }

        foreach ($allData as $data) {
            $raw = $data['raw'];
            $itemData = [
                'transaction_date' => $data['date'], // Always required
                'raw_data' => $raw // Always keep raw
            ];
            
            $nominalFound = false;

            // Extract dynamic data based on headers
            foreach ($headers as $header) {
                // Skip if it's our manually added transaction_date or we already handled it
                if ($header['key'] === 'transaction_date') continue;

                $val = null;
                // Simple dot notation access for now (or use data_get equivalent helper if needed, but array access is faster for simple keys)
                // If path has dot, it might need deeper access, but for now assuming flat or 1 level from template mapping
                
                // Handle different extraction strategies relative to the structure of 'raw'
                // Note: 'raw' is the item from API. using 'path' from template.
                
                if (isset($raw[$header['path']])) {
                    $val = $raw[$header['path']];
                } else {
                    // Try to find case-insensitive
                    foreach ($raw as $k => $v) {
                        if (strcasecmp($k, $header['path']) === 0) {
                            $val = $v;
                            break;
                        }
                    }
                }

                if ($header['type'] === 'currency' || $header['key'] === 'nominal' || strtolower($header['label']) === 'nominal') {
                    $val = (float) str_replace(['.', ','], '', (string)$val);
                    // Ensure we have a strictly named 'nominal' field for the system to work
                    $itemData['nominal'] = $val; 
                    $nominalFound = true;
                }

                $itemData[$header['key']] = $val;
            }

            // Fallback for Nominal if not found in custom headers
            if (!$nominalFound) {
                 $nominal = 0;
                 foreach ($raw as $k => $v) {
                    if (preg_match('/nominal|amount|nilai|tagihan/i', $k)) {
                        $nominal = (float) str_replace(['.', ','], '', (string)$v);
                        break;
                    }
                }
                $itemData['nominal'] = $nominal;
            }

            $parsedItems[] = $itemData;
        }

        // Return both items and headers configuration
        return [
            'items' => $parsedItems,
            'headers' => $headers
        ];
    }

    public function detail(Request $request)
    {
        $request->validate([
            'district_id' => 'required|exists:districts,id',
            'proccode_id' => 'required|exists:proccodes,id',
        ]);

        $district = District::findOrFail($request->district_id);
        $proccode = Proccode::with('template')->findOrFail($request->proccode_id);

        // Fetch Items via Batches
        // We get items where batch matches district and proccode
        $items = ConsolidationItem::whereHas('batch', function($q) use ($district, $proccode) {
            $q->where('district_id', $district->id)
              ->where('proccode_id', $proccode->id);
        })
        ->orderBy('transaction_date', 'desc')
        ->paginate(50)
        ->withQueryString();

        return Inertia::render('admin/konsolidasi/detail', [
            'district' => $district,
            'proccode' => $proccode,
            'items' => $items,
        ]);
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'district_id' => 'required|exists:districts,id',
            'proccode_id' => 'required|exists:proccodes,id',
        ]);

        $districtId = $request->district_id;
        $proccodeId = $request->proccode_id;

        try {
            DB::beginTransaction();

            $batchIds = ConsolidationBatch::where('district_id', $districtId)
                ->where('proccode_id', $proccodeId)
                ->pluck('id');

            if ($batchIds->isNotEmpty()) {
                ConsolidationItem::whereIn('batch_id', $batchIds)->delete();
                ConsolidationBatch::whereIn('id', $batchIds)->delete();
            }

            DB::commit();

            return redirect()->route('admin.konsolidasi.index')
                ->with('success', 'Data berhasil direset/dihapus.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal menghapus data: ' . $e->getMessage());
        }
    }
}
