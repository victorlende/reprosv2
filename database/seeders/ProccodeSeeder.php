<?php

namespace Database\Seeders;

use App\Models\Proccode;
use App\Models\Template;
use Illuminate\Database\Seeder;

class ProccodeSeeder extends Seeder
{
    public function run(): void
    {
        // Get templates
        $templatePbbA = Template::where('category', 'PBB')
            ->whereHas('vendor', fn($q) => $q->where('code', 'vendor_a'))
            ->first();

        $templatePbbB = Template::where('category', 'PBB')
            ->whereHas('vendor', fn($q) => $q->where('code', 'vendor_b'))
            ->first();

        $templatePajakAir = Template::where('category', 'Pajak Air Tanah')
            ->whereHas('vendor', fn($q) => $q->where('code', 'vendor_a'))
            ->first();

        if (!$templatePbbA || !$templatePajakAir) {
            $this->command->error('Templates not found! Run TemplateSeeder first.');
            return;
        }

        $proccodes = [
            [
                'code' => '180V82,180G12',
                'name' => 'Pajak Air Tanah - Kabupaten Manggarai',
                'description' => 'Pembayaran pajak air tanah untuk wilayah Kabupaten Manggarai',
                'source' => 'psw1',
                'category' => 'Pajak Air Tanah',
                'template_id' => $templatePajakAir->id,
                'is_active' => true,
            ],
            [
                'code' => '180V42,180E10',
                'name' => 'PBB - Kabupaten Ende',
                'description' => 'Pajak Bumi dan Bangunan untuk wilayah Kabupaten Ende (Vendor A)',
                'source' => 'psw1',
                'category' => 'PBB',
                'template_id' => $templatePbbA->id,
                'is_active' => true,
            ],
            [
                'code' => '180V82,180G12',
                'name' => 'Pajak Air Tanah - Kabupaten Kupang',
                'description' => 'Pembayaran pajak air tanah untuk wilayah Kabupaten Kupang',
                'source' => 'psw2',
                'category' => 'Pajak Air Tanah',
                'template_id' => $templatePajakAir->id,
                'is_active' => true,
            ],
            [
                'code' => '180V42,180E10',
                'name' => 'PBB - Kabupaten Kupang',
                'description' => 'Pajak Bumi dan Bangunan untuk wilayah Kabupaten Kupang (Vendor A)',
                'source' => 'psw2',
                'category' => 'PBB',
                'template_id' => $templatePbbA->id,
                'is_active' => true,
            ],
            [
                'code' => '180V42,180E10',
                'name' => 'PBB - Kabupaten Flores Timur',
                'description' => 'Pajak Bumi dan Bangunan untuk wilayah Kabupaten Flores Timur (Vendor B)',
                'source' => 'psw3',
                'category' => 'PBB',
                'template_id' => $templatePbbB ? $templatePbbB->id : $templatePbbA->id,
                'is_active' => true,
            ],
        ];

        foreach ($proccodes as $proccode) {
            Proccode::updateOrCreate(
                [
                    'code' => $proccode['code'],
                    'source' => $proccode['source'],
                ],
                $proccode
            );
        }
    }
}
