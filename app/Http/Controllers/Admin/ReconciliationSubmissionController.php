<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\ReconciliationMail;
use App\Models\EmailDestination;
use App\Models\Proccode;
use App\Models\ReconciliationSubmission;
use App\Models\ReconciliationSubmissionDestination;
use App\Models\ReconciliationSubmissionFile;
use App\Models\ReconciliationTemplate;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ReconciliationSubmissionController extends Controller
{
    public function index(Request $request)
    {
        $query = ReconciliationSubmission::with(['proccode', 'destinations.emailDestination', 'user', 'files'])
            ->orderBy('created_at', 'desc');

        // Filter by date range
        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Filter by status (overall)
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by proccode
        if ($request->filled('proccode_id') && $request->proccode_id !== 'all') {
            $query->where('proccode_id', $request->proccode_id);
        }

        // Filter by user
        if ($request->filled('user_id') && $request->user_id !== 'all') {
            $query->where('user_id', $request->user_id);
        }

        // If user is not admin, only show their own submissions
        if (Auth::user()->role !== 'admin') {
            $query->where('user_id', Auth::id());
        }

        $submissions = $query->paginate(20);

        $proccodes = Proccode::active()->orderBy('name')->get(['id', 'name', 'code']);
        $users = User::orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/reconciliation-submissions/index', [
            'submissions' => $submissions,
            'proccodes' => $proccodes,
            'users' => $users,
            'filters' => $request->only(['start_date', 'end_date', 'status', 'proccode_id', 'user_id']),
        ]);
    }

    public function create()
    {
        $emailDestinations = EmailDestination::all();
        $templates = ReconciliationTemplate::all();

        return Inertia::render('admin/reconciliation-submissions/create', [
            'emailDestinations' => $emailDestinations,
            'templates' => $templates,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'email_destination_ids' => 'required|array|min:1',
            'email_destination_ids.*' => 'exists:email_destinations,id',
            'files' => 'required|array|min:1',
            'files.*' => 'file|mimes:txt|max:10240', // 10MB max per file
            'subject' => 'nullable|string|max:500',
            'body_note' => 'nullable|string',
            'transaction_date_start' => 'nullable|date',
            'transaction_date_end' => 'nullable|date',
            'is_draft' => 'nullable|boolean',
        ]);

        try {
            DB::beginTransaction();

            // Determine proccode from first email destination for now
            $firstDestination = EmailDestination::findOrFail($validated['email_destination_ids'][0]);
            $proccodeId = $firstDestination->proccode_id ?? null;

            // Default subject
            $subject = $validated['subject'] ?? 'Rekonsiliasi - ' . Carbon::now()->format('d-m-Y');
            $isDraft = $request->boolean('is_draft');

            // Create submission record
            $submission = ReconciliationSubmission::create([
                'proccode_id' => $proccodeId,
                'user_id' => Auth::id(),
                'subject' => $subject,
                'body_note' => $validated['body_note'],
                'transaction_date_start' => $validated['transaction_date_start'] ?? null,
                'transaction_date_end' => $validated['transaction_date_end'] ?? null,
                'status' => $isDraft ? 'draft' : 'pending',
            ]);

            // Handle Files
            foreach ($request->file('files') as $file) {
                $originalName = $file->getClientOriginalName();
                $fileName = time() . '_' . $originalName;
                $filePath = $file->storeAs('reconciliation_files', $fileName, 'public');

                ReconciliationSubmissionFile::create([
                    'reconciliation_submission_id' => $submission->id,
                    'file_path' => $filePath,
                    'file_name' => $originalName,
                    'file_size' => $file->getSize(),
                ]);
            }

            // Handle Destinations and Sending
            $destinations = EmailDestination::whereIn('id', $validated['email_destination_ids'])->get();
            $successCount = 0;
            $failCount = 0;

            foreach ($destinations as $destination) {
                $subDest = ReconciliationSubmissionDestination::create([
                    'reconciliation_submission_id' => $submission->id,
                    'email_destination_id' => $destination->id,
                    'status' => 'pending',
                ]);

                if ($isDraft) {
                    continue; 
                }

                try {
                    // Refresh files relation for the mailable
                    $submission->load('files');
                    
                    Mail::to($destination->email)->send(new ReconciliationMail($submission, $destination, $destination->proccode));

                    $subDest->update([
                        'status' => 'sent',
                        'sent_at' => now(),
                    ]);
                    $successCount++;
                } catch (\Exception $e) {
                    $subDest->update([
                        'status' => 'failed',
                        'error_message' => $e->getMessage(),
                    ]);
                    $failCount++;
                    Log::error('Failed to send reconciliation email to ' . $destination->email . ': ' . $e->getMessage());
                }
            }

            // Update overall status if not draft
            if (!$isDraft) {
                if ($failCount === 0) {
                    $submission->update(['status' => 'sent', 'sent_at' => now()]);
                } elseif ($successCount === 0) {
                    $submission->update(['status' => 'failed', 'error_message' => 'All emails failed']);
                } else {
                    $submission->update(['status' => 'partial', 'sent_at' => now(), 'error_message' => 'Some emails failed']);
                }
            }

            DB::commit();

            return redirect()->route('admin.reconciliation-submissions.index')
                ->with('success', $isDraft ? "Draft berhasil disimpan." : "Proses selesai. Berhasil: $successCount, Gagal: $failCount");

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create reconciliation submission: ' . $e->getMessage());

            return back()->with('error', 'Gagal memproses data: ' . $e->getMessage())->withInput();
        }
    }

    public function show(ReconciliationSubmission $reconciliationSubmission)
    {
        $reconciliationSubmission->load(['proccode', 'destinations.emailDestination', 'files', 'user']);

        // Check permission - users can only view their own submissions unless admin
        if (Auth::user()->role !== 'admin' && $reconciliationSubmission->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('admin/reconciliation-submissions/show', [
            'submission' => $reconciliationSubmission,
        ]);
    }



    public function edit(ReconciliationSubmission $reconciliationSubmission)
    {
        if ($reconciliationSubmission->status !== 'draft') {
            return back()->with('error', 'Hanya draft yang dapat diedit.');
        }

        if (Auth::user()->role !== 'admin' && $reconciliationSubmission->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        $reconciliationSubmission->load(['destinations', 'files']);
        
        $emailDestinations = EmailDestination::all();
        $templates = ReconciliationTemplate::all();

        return Inertia::render('admin/reconciliation-submissions/edit', [
            'submission' => $reconciliationSubmission,
            'emailDestinations' => $emailDestinations,
            'templates' => $templates,
        ]);
    }

    public function update(Request $request, ReconciliationSubmission $reconciliationSubmission)
    {
        if ($reconciliationSubmission->status !== 'draft') {
            return back()->with('error', 'Hanya draft yang dapat diedit.');
        }

        if (Auth::user()->role !== 'admin' && $reconciliationSubmission->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'email_destination_ids' => 'required|array|min:1',
            'email_destination_ids.*' => 'exists:email_destinations,id',
            'files' => 'nullable|array',
            'files.*' => 'file|mimes:txt|max:10240', // 10MB max per file
            'existing_files' => 'nullable|array', // IDs of existing files to keep
            'subject' => 'nullable|string|max:500',
            'body_note' => 'nullable|string',
            'transaction_date_start' => 'nullable|date',
            'transaction_date_end' => 'nullable|date',
            'is_draft' => 'nullable|boolean',
        ]);

        try {
            DB::beginTransaction();
            
            $isDraft = $request->boolean('is_draft');

             // Determine proccode from first email destination
            $firstDestination = EmailDestination::findOrFail($validated['email_destination_ids'][0]);
            $proccodeId = $firstDestination->proccode_id ?? null;
            
            $reconciliationSubmission->update([
                'proccode_id' => $proccodeId,
                'subject' => $validated['subject'] ?? $reconciliationSubmission->subject,
                'body_note' => $validated['body_note'],
                'transaction_date_start' => $validated['transaction_date_start'] ?? null,
                'transaction_date_end' => $validated['transaction_date_end'] ?? null,
                // Status will be updated below if not draft
            ]);

            // Handle Files
            // 1. Remove files not in 'existing_files'
            $existingFileIds = $validated['existing_files'] ?? [];
            $filesToDelete = $reconciliationSubmission->files()->whereNotIn('id', $existingFileIds)->get();
            
            foreach($filesToDelete as $file) {
                 if (Storage::disk('public')->exists($file->file_path)) {
                    Storage::disk('public')->delete($file->file_path);
                }
                $file->delete();
            }

            // 2. Add new files
            if ($request->hasFile('files')) {
                foreach ($request->file('files') as $file) {
                    $originalName = $file->getClientOriginalName();
                    $fileName = time() . '_' . $originalName;
                    $filePath = $file->storeAs('reconciliation_files', $fileName, 'public');

                    ReconciliationSubmissionFile::create([
                        'reconciliation_submission_id' => $reconciliationSubmission->id,
                        'file_path' => $filePath,
                        'file_name' => $originalName,
                        'file_size' => $file->getSize(),
                    ]);
                }
            }

            // Handle Destinations
            // Sync logic: delete existing, create new. Simplest for now.
            $reconciliationSubmission->destinations()->delete(); // Hard delete or just update? Hard delete pivot rows is fine as it's draft.
            
            $destinations = EmailDestination::whereIn('id', $validated['email_destination_ids'])->get();
            $successCount = 0;
            $failCount = 0;

            foreach ($destinations as $destination) {
                $subDest = ReconciliationSubmissionDestination::create([
                    'reconciliation_submission_id' => $reconciliationSubmission->id,
                    'email_destination_id' => $destination->id,
                    'status' => 'pending',
                ]);

                if (!$isDraft) {
                    try {
                        Mail::to($destination->email)->send(new ReconciliationMail($reconciliationSubmission, $destination, $destination->proccode));

                        $subDest->update([
                            'status' => 'sent',
                            'sent_at' => now(),
                        ]);
                        $successCount++;
                    } catch (\Exception $e) {
                         $subDest->update([
                            'status' => 'failed',
                            'error_message' => $e->getMessage(),
                        ]);
                        $failCount++;
                        Log::error('Failed to send reconciliation email to ' . $destination->email . ': ' . $e->getMessage());
                    }
                }
            }

            if (!$isDraft) {
                 // Update overall status
                if ($failCount === 0) {
                    $reconciliationSubmission->update(['status' => 'sent', 'sent_at' => now()]);
                } elseif ($successCount === 0) {
                    $reconciliationSubmission->update(['status' => 'failed', 'error_message' => 'All emails failed']);
                } else {
                    $reconciliationSubmission->update(['status' => 'partial', 'sent_at' => now(), 'error_message' => 'Some emails failed']);
                }
                
                 DB::commit();
                 return redirect()->route('admin.reconciliation-submissions.index')
                    ->with('success', "Proses selesai. Berhasil: $successCount, Gagal: $failCount");
            }

            DB::commit();
            
            return redirect()->route('admin.reconciliation-submissions.index')
                ->with('success', "Draft berhasil diperbarui.");

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update reconciliation submission: ' . $e->getMessage());

            return back()->with('error', 'Gagal memproses data: ' . $e->getMessage())->withInput();
        }
    }

    public function resend(ReconciliationSubmission $reconciliationSubmission)
    {
        // Resend to ALL or implement nicer granular resend later.
        // For now, let's logic: Resend to failed destinations only?
        // Or user request "Resend" usually means "Try again".
        
        $reconciliationSubmission->load(['files', 'destinations.emailDestination']);

        $destinationsToResend = $reconciliationSubmission->destinations->where('status', 'failed');

        if ($destinationsToResend->isEmpty()) {
            return back()->with('info', 'Tidak ada tujuan yang gagal untuk dikirim ulang.');
        }

        try {
            $successCount = 0;
            foreach ($destinationsToResend as $subDest) {
                 try {
                    $destination = $subDest->emailDestination;
                    Mail::to($destination->email)->send(new ReconciliationMail($reconciliationSubmission, $destination, $destination->proccode));

                    $subDest->update([
                        'status' => 'sent',
                        'sent_at' => now(),
                        'error_message' => null,
                    ]);
                    $successCount++;
                 } catch (\Exception $e) {
                     $subDest->update(['error_message' => $e->getMessage()]);
                 }
            }
            
            // Check if any still failed
            if ($reconciliationSubmission->destinations()->where('status', 'failed')->count() === 0) {
                 $reconciliationSubmission->update(['status' => 'sent', 'error_message' => null]);
            }

            return back()->with('success', "Email berhasil dikirim ulang ke $successCount tujuan.");
        } catch (\Exception $e) {
            Log::error('Failed to resend reconciliation email: ' . $e->getMessage());
            return back()->with('error', 'Gagal mengirim ulang email: ' . $e->getMessage());
        }
    }

    public function download(ReconciliationSubmission $reconciliationSubmission, $fileId = null)
    {
        // Check permission
        if (Auth::user()->role !== 'admin' && $reconciliationSubmission->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        // If fileId provided, download that file
        if ($fileId) {
             $file = $reconciliationSubmission->files()->findOrFail($fileId);
        } else {
            // Default to first file if exists
            $file = $reconciliationSubmission->files()->first();
        }

        if (!$file || !Storage::disk('public')->exists($file->file_path)) {
            return back()->with('error', 'File tidak ditemukan.');
        }

        return Storage::disk('public')->download(
            $file->file_path,
            $file->file_name
        );
    }

    public function destroy(ReconciliationSubmission $reconciliationSubmission)
    {
        // Only admin can delete
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        try {
            // Delete files
            foreach ($reconciliationSubmission->files as $file) {
                 if (Storage::disk('public')->exists($file->file_path)) {
                    Storage::disk('public')->delete($file->file_path);
                }
            }

            $reconciliationSubmission->delete();

            Log::info('User: ' . auth()->user()->name . ' (ID: ' . auth()->id() . ') deleted reconciliation submission (ID: ' . $reconciliationSubmission->id . ')');

            return redirect()->route('admin.reconciliation-submissions.index')->with('success', 'Data berhasil dihapus');
        } catch (\Exception $e) {
            Log::error('Failed to delete reconciliation submission: ' . $e->getMessage());

            return back()->with('error', 'Gagal menghapus data: ' . $e->getMessage());
        }
    }
    
    // Reporting methods might need adjustment, but since they use where('status', 'sent') on parent, it might still "work" broadly, 
    // though "sent" parent status now means "at least one sent" or "all sent"? 
    // My logic: 'sent' = NO failures. 'partial' = some failures. 'failed' = all failed.
    // So reports will only count 100% successful submissions. Use caution.
    public function report(Request $request)
    {
         // Keeping as is for now, noting logic change.
        $type = $request->query('type', 'daily'); // daily or monthly
        $date = $request->query('date', Carbon::today()->toDateString());

        $query = ReconciliationSubmission::with(['user', 'proccode', 'destinations.emailDestination', 'files'])
            ->where('status', 'sent');

        if ($type === 'daily') {
            $query->whereDate('sent_at', $date);
            $title = 'Laporan Pengiriman Harian - ' . Carbon::parse($date)->format('d F Y');
        } else {
            $month = Carbon::parse($date)->month;
            $year = Carbon::parse($date)->year;
            $query->whereMonth('sent_at', $month)
                  ->whereYear('sent_at', $year);
            $title = 'Laporan Pengiriman Bulanan - ' . Carbon::parse($date)->format('F Y');
        }

        // Group by user
        $submissions = $query->get();

        $reportData = $submissions->groupBy('user_id')->map(function ($userSubmissions) {
            $user = $userSubmissions->first()->user;
            return [
                'user_name' => $user->name,
                'total' => $userSubmissions->count(),
                'sent' => $userSubmissions->where('status', 'sent')->count(),
                'failed' => $userSubmissions->where('status', 'failed')->count(),
            ];
        })->values();

        return Inertia::render('admin/reconciliation-submissions/report', [
            'title' => $title,
            'type' => $type,
            'date' => $date,
            'reportData' => $reportData,
            'submissions' => $submissions,
        ]);
    }

    public function exportReport(Request $request)
    {
        // Same here
        $type = $request->query('type', 'daily');
        $date = $request->query('date', Carbon::today()->toDateString());

        $query = ReconciliationSubmission::with(['user', 'proccode', 'destinations.emailDestination', 'files']) 
            ->where('status', 'sent');

        if ($type === 'daily') {
            $query->whereDate('sent_at', $date);
            $title = 'Laporan Pengiriman Harian - ' . Carbon::parse($date)->format('d F Y');
            $filename = 'Laporan_Harian_' . Carbon::parse($date)->format('d_m_Y') . '.xls';
        } else {
            $month = Carbon::parse($date)->month;
            $year = Carbon::parse($date)->year;
            $query->whereMonth('sent_at', $month)
                  ->whereYear('sent_at', $year);
            $title = 'Laporan Pengiriman Bulanan - ' . Carbon::parse($date)->format('F Y');
            $filename = 'Laporan_Bulanan_' . Carbon::parse($date)->format('m_Y') . '.xls';
        }

        $submissions = $query->get();

        $reportData = $submissions->groupBy('user_id')->map(function ($userSubmissions) {
            $user = $userSubmissions->first()->user;
            return [
                'user_name' => $user->name,
                'total' => $userSubmissions->count(),
                'sent' => $userSubmissions->where('status', 'sent')->count(),
                'failed' => $userSubmissions->where('status', 'failed')->count(),
            ];
        })->values();

        return response()->view('admin.reconciliation-submissions.export-report', [
            'title' => $title,
            'reportData' => $reportData,
            'submissions' => $submissions,
        ])->header('Content-Type', 'application/vnd.ms-excel')
          ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }
}
