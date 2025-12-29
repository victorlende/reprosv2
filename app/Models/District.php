<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class District extends Model
{
    protected $fillable = [
        'code',
        'name',
        'branch_code',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function proccodes()
    {
        return $this->hasMany(Proccode::class);
    }
}
