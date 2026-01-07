<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReconciliationSubmissionDestination extends Model
{
    use HasFactory;

    protected $fillable = [
        'reconciliation_submission_id',
        'email_destination_id',
        'status',
        'sent_at',
        'error_message',
    ];

    public function submission()
    {
        return $this->belongsTo(ReconciliationSubmission::class, 'reconciliation_submission_id');
    }

    public function emailDestination()
    {
        return $this->belongsTo(EmailDestination::class);
    }
}
