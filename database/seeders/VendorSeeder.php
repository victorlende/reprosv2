<?php

namespace Database\Seeders;

use App\Models\Vendor;
use Illuminate\Database\Seeder;

class VendorSeeder extends Seeder
{
    public function run(): void
    {
        $vendors = [
            [
                'name' => 'Vendor A - Core System',
                'code' => 'vendor_a',
                'description' => 'Vendor utama untuk sebagian besar kabupaten',
                'is_active' => true,
            ],
            [
                'name' => 'Vendor B - Alternative System',
                'code' => 'vendor_b',
                'description' => 'Vendor alternatif untuk beberapa kabupaten',
                'is_active' => true,
            ],
            [
                'name' => 'Vendor C - Legacy System',
                'code' => 'vendor_c',
                'description' => 'Vendor untuk sistem lama',
                'is_active' => true,
            ],
        ];

        foreach ($vendors as $vendor) {
            Vendor::updateOrCreate(
                ['code' => $vendor['code']],
                $vendor
            );
        }
    }
}
