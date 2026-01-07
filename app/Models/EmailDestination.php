<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailDestination extends Model
{
    use HasFactory;

    protected $fillable = [
        'proccode_id',
        'name',
        'email',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function proccode()
    {
        return $this->belongsTo(Proccode::class);
    }

    public function reconciliationSubmissionDestinations()
    {
        return $this->hasMany(ReconciliationSubmissionDestination::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
