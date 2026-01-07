<?php

namespace App\Http\Controllers;

use App\Models\ReconciliationTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReconciliationTemplateController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $template = ReconciliationTemplate::create([
            'name' => $validated['name'],
            'content' => $validated['content'],
        ]);

        return redirect()->back()->with('success', 'Template created successfully.');
    }

    public function update(Request $request, ReconciliationTemplate $template)
    {
        // Ensure user owns the template
        if ($template->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $template->update($validated);

        return redirect()->back()->with('success', 'Template updated successfully.');
    }

    public function destroy(ReconciliationTemplate $template)
    {
        if ($template->user_id !== Auth::id()) {
            abort(403);
        }

        $template->delete();

        return redirect()->back()->with('success', 'Template deleted successfully.');
    }
}
