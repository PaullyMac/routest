<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LocationsTableSeeder extends Seeder
{
    public function run(): void
    {
        $locations = [
            ['Main Warehouse - Mandaluyong', 14.5836, 121.0409],
            ['SM Mall of Asia', 14.5352, 120.9822],
            ['Greenbelt Mall', 14.5516, 121.0233],
            ['SM Megamall', 14.5833, 121.0567],
            ['Market! Market!', 14.5536, 121.0546],
            ['Robinsons Galleria', 14.5896, 121.0614],
            ['SM North EDSA', 14.6556, 121.0313],
            ['Trinoma Mall', 14.6537, 121.0321],
            ['Gateway Mall', 14.6206, 121.0526],
            ['SM City Manila', 14.5881, 120.9814],
            ['Lucky Chinatown Mall', 14.6054, 120.9734],
            ['SM Aura Premier', 14.5456, 121.0559],
            ['Robinsons Place Manila', 14.5730, 120.9820],
            ['Ayala Malls Vertis North', 14.6543, 121.0327],
            ['Fisher Mall', 14.6300, 121.0045],
            ['SM City Sta. Mesa', 14.6031, 121.0275],
            ['Alabang Town Center', 14.4269, 121.0314],
            ['Festival Mall Alabang', 14.4143, 121.0438],
            ['Eastwood Mall', 14.6101, 121.0791],
            ['Robinsons Magnolia', 14.6162, 121.0336],
            ['Venice Grand Canal Mall', 14.5404, 121.0530],
        ];

        foreach ($locations as $loc) {
            DB::table('locations')->insert([
                'id' => Str::uuid()->toString(),
                'name' => $loc[0],
                'latitude' => $loc[1],
                'longitude' => $loc[2],
            ]);
        }
    }
}
