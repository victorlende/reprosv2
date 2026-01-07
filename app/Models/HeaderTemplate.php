<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HeaderTemplate extends Model
{
    protected $fillable = ['name', 'description', 'schema', 'is_active'];

    protected $casts = [
        'schema' => 'array',
        'is_active' => 'boolean',
    ];
}
