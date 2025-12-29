<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Template extends Model
{
    use HasFactory;

    protected $fillable = [
        'vendor_id',
        'category',
        'name',
        'mapping',
        'processor_class',
        'description',
        'valid_response_codes',
        'is_active',
    ];

    protected $casts = [
        'mapping' => 'array',
        'is_active' => 'boolean',
    ];

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function proccodes()
    {
        return $this->hasMany(Proccode::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeCategory($query, $category)
    {
        return $query->where('category', $category);
    }
}
