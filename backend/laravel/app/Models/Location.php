<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    public $timestamps = false;
    protected $fillable = ['name', 'latitude', 'longitude'];
    public $incrementing = false;
    protected $keyType = 'string';
}
