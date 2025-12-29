<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proccode extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'source',
        'category',
        'template_id',
        'receipt_template_id',
        'receipt_config',
        'is_active',
        'district_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'receipt_config' => 'array',
    ];

    public function template()
    {
        return $this->belongsTo(Template::class);
    }

    public function receiptTemplate()
    {
        return $this->belongsTo(ReceiptTemplate::class);
    }

    public function district()
    {
        return $this->belongsTo(District::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
