<?php

namespace Database\Seeders;

use App\Models\ReconciliationTemplate;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReconciliationTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            [
                'name' => 'Laporan Harian',
                'content' => "<p>Yth. Rekan Bank NTT,</p><p><br></p><p>Terlampir laporan transaksi harian untuk tanggal <strong>[Tanggal]</strong>.</p><p>Mohon konfirmasinya.</p><p><br></p><p>Terima kasih,</p><p>[Nama Pengirim]</p>",
            ],
            [
                'name' => 'Laporan Bulanan',
                'content' => "<p>Yth. Rekan Bank NTT,</p><p><br></p><p>Terlampir laporan rekapitulasi transaksi bulanan untuk periode <strong>[Bulan] [Tahun]</strong>.</p><p>Mohon diperiksa kembali.</p><p><br></p><p>Terima kasih,</p><p>[Nama Pengirim]</p>",
            ],
            [
                'name' => 'Koreksi Transaksi',
                'content' => "<p>Yth. Rekan Bank NTT,</p><p><br></p><p>Berikut kami sampaikan koreksi atas transaksi pada tanggal <strong>[Tanggal]</strong> dengan rincian terlampir.</p><p>Mohon tindak lanjutnya.</p><p><br></p><p>Terima kasih,</p><p>[Nama Pengirim]</p>",
            ],
            [
                'name' => 'Permintaan Data',
                'content' => "<p>Yth. Rekan Bank NTT,</p><p><br></p><p>Mohon bantuan untuk mengirimkan data transaksi pada tanggal <strong>[Tanggal]</strong> karena terdapat selisih pencatatan di sistem kami.</p><p>Atas kerjasamanya kami ucapkan terima kasih.</p><p><br></p><p>Salam,</p><p>[Nama Pengirim]</p>",
            ],
        ];

        foreach ($templates as $template) {
            ReconciliationTemplate::firstOrCreate(
                ['name' => $template['name']],
                ['content' => $template['content']]
            );
        }
    }
}
