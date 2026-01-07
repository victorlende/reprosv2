<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConsolidationBatch extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'upload_date' => 'date',
        'total_items' => 'integer',
        'total_nominal' => 'decimal:2',
    ];

    public function proccode()
    {
        return $this->belongsTo(Proccode::class);
    }

    public function district()
    {
        return $this->belongsTo(District::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(ConsolidationItem::class, 'batch_id');
    }
}
