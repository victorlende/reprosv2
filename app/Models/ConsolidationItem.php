<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConsolidationItem extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'transaction_date' => 'date',
        'nominal' => 'decimal:2',
        'raw_data' => 'array',
    ];

    public function batch()
    {
        return $this->belongsTo(ConsolidationBatch::class, 'batch_id');
    }
}
