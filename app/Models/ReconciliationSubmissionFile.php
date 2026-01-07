<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReconciliationSubmissionFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'reconciliation_submission_id',
        'file_path',
        'file_name',
        'file_size',
    ];

    public function submission()
    {
        return $this->belongsTo(ReconciliationSubmission::class, 'reconciliation_submission_id');
    }
}
