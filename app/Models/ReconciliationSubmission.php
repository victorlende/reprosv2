<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReconciliationSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'proccode_id',
        'user_id',
        'transaction_date_start',
        'transaction_date_end',
        'subject',
        'body_note',
        'status',
        'sent_at',
        'error_message',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'transaction_date_start' => 'date',
        'transaction_date_end' => 'date',
    ];

    public function proccode()
    {
        return $this->belongsTo(Proccode::class);
    }

    public function files()
    {
        return $this->hasMany(ReconciliationSubmissionFile::class);
    }

    public function destinations()
    {
        return $this->hasMany(ReconciliationSubmissionDestination::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
