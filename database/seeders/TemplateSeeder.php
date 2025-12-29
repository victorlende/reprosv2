<?php

namespace Database\Seeders;

use App\Models\Template;
use App\Models\Vendor;
use Illuminate\Database\Seeder;

class TemplateSeeder extends Seeder
{
    public function run(): void
    {
        $vendorA = Vendor::where('code', 'vendor_a')->first();
        $vendorB = Vendor::where('code', 'vendor_b')->first();

        if (!$vendorA || !$vendorB) {
            $this->command->error('Vendors not found! Run VendorSeeder first.');
            return;
        }

        $templates = [
            // PBB Vendor A
            [
                'vendor_id' => $vendorA->id,
                'category' => 'PBB',
                'name' => 'Template PBB Vendor A',
                'description' => 'Template untuk PBB menggunakan Vendor A',
                'mapping' => [
                    'table_columns' => [
                        ['label' => 'NOP', 'path' => 'Wfirstdata.2', 'type' => 'string'],
                        ['label' => 'Nama Wajib Pajak', 'path' => 'Wseconddata.10', 'type' => 'string'],
                        ['label' => 'Alamat', 'path' => 'Wseconddata.11', 'type' => 'string'],
                        ['label' => 'Tahun Pajak', 'path' => 'Wseconddata.5', 'type' => 'string'],
                        ['label' => 'Jumlah Tagihan', 'path' => 'Wtxamount', 'type' => 'currency'],
                        ['label' => 'Tanggal', 'path' => 'Wtransdate', 'type' => 'date'],
                    ]
                ],
                'is_active' => true,
            ],
            // PBB Vendor B
            [
                'vendor_id' => $vendorB->id,
                'category' => 'PBB',
                'name' => 'Template PBB Vendor B',
                'description' => 'Template untuk PBB menggunakan Vendor B',
                'mapping' => [
                    'table_columns' => [
                        ['label' => 'NOP', 'path' => 'Wfirstdata.5', 'type' => 'string'],
                        ['label' => 'Nama WP', 'path' => 'Wseconddata.8', 'type' => 'string'],
                        ['label' => 'Lokasi', 'path' => 'Wseconddata.12', 'type' => 'string'],
                        ['label' => 'Periode', 'path' => 'Wseconddata.3', 'type' => 'string'],
                        ['label' => 'Total Bayar', 'path' => 'Wactamount', 'type' => 'currency'],
                        ['label' => 'Waktu', 'path' => 'Wtransdate', 'type' => 'date'],
                    ]
                ],
                'is_active' => true,
            ],
            // BPHTB Vendor A
            [
                'vendor_id' => $vendorA->id,
                'category' => 'BPHTB',
                'name' => 'Template BPHTB Vendor A',
                'description' => 'Template untuk BPHTB menggunakan Vendor A',
                'mapping' => [
                    'table_columns' => [
                        ['label' => 'No. SSB', 'path' => 'Wfirstdata.1', 'type' => 'string'],
                        ['label' => 'Nama Pembeli', 'path' => 'Wseconddata.7', 'type' => 'string'],
                        ['label' => 'Nama Penjual', 'path' => 'Wseconddata.9', 'type' => 'string'],
                        ['label' => 'Lokasi Objek', 'path' => 'Wseconddata.15', 'type' => 'string'],
                        ['label' => 'NPOP', 'path' => 'Wfirstdata.4', 'type' => 'currency'],
                        ['label' => 'BPHTB Terutang', 'path' => 'Wtxamount', 'type' => 'currency'],
                        ['label' => 'Tanggal', 'path' => 'Wtransdate', 'type' => 'date'],
                    ]
                ],
                'is_active' => true,
            ],
            // Pajak Air Tanah Vendor A
            [
                'vendor_id' => $vendorA->id,
                'category' => 'Pajak Air Tanah',
                'name' => 'Template Pajak Air Vendor A',
                'description' => 'Template untuk Pajak Air Tanah menggunakan Vendor A',
                'mapping' => [
                    'table_columns' => [
                        ['label' => 'No. Rekening', 'path' => 'WRemoteAccNo', 'type' => 'string'],
                        ['label' => 'Nama Wajib Pajak', 'path' => 'Wseconddata.10', 'type' => 'string'],
                        ['label' => 'Alamat', 'path' => 'Wseconddata.11', 'type' => 'string'],
                        ['label' => 'Periode', 'path' => 'Wseconddata.12', 'type' => 'string'],
                        ['label' => 'Jumlah', 'path' => 'Wtxamount', 'type' => 'currency'],
                        ['label' => 'Tanggal', 'path' => 'Wtransdate', 'type' => 'date'],
                    ]
                ],
                'is_active' => true,
            ],
        ];

        foreach ($templates as $template) {
            Template::updateOrCreate(
                [
                    'vendor_id' => $template['vendor_id'],
                    'category' => $template['category'],
                ],
                $template
            );
        }
    }
}
