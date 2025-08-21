<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RouteRequest extends Model
{
    public $timestamps = false;
    protected $fillable = ['origin_id', 'stops', 'status'];
    protected $casts = ['stops' => 'array'];
    public $incrementing = false;
    protected $keyType = 'string';
}
