<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RouteResult extends Model
{
    public $timestamps = false;
    protected $fillable = ['request_id', 'optimized_order', 'total_distance', 'total_duration', 'legs'];
    protected $casts = [
        'optimized_order' => 'array',
        'legs' => 'array'
    ];
    public $incrementing = false;
    protected $keyType = 'string';
}
