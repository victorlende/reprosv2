# Setup Proccode Dropdown - Panduan Lengkap

## Perubahan yang Dibuat:

### 1. Database
- ✅ Tabel `proccodes` untuk menyimpan data proccode
- ✅ Seeder dengan 5 contoh data proccode

### 2. Backend
- ✅ Model `Proccode`
- ✅ Controller updated untuk load data proccode

### 3. Frontend
- ✅ Field proccode diubah dari text input menjadi dropdown select
- ✅ Field source disembunyikan (otomatis terisi dari data proccode yang dipilih)
- ✅ Grid berubah dari 3 kolom menjadi 2 kolom (Jenis Transaksi + Tanggal)

---

## Cara Setup Database:

### 1. Run Migration

Buka terminal dan jalankan:

```bash
cd C:\Users\bpdntt\Herd\reprosv2
php artisan migrate
```

Atau jika menggunakan Laravel Herd:
```bash
herd php artisan migrate
```

### 2. Run Seeder

Setelah migration sukses, jalankan seeder:

```bash
php artisan db:seed --class=ProccodeSeeder
```

Atau jika menggunakan Herd:
```bash
herd php artisan db:seed --class=ProccodeSeeder
```

---

## Data Proccode yang Diinsert:

Seeder akan menambahkan 5 data:

1. **Pajak Air Tanah - Kabupaten Manggarai**
   - Code: `180V82,180G12`
   - Source: `psw1`
   - Category: Pajak Air Tanah

2. **PBB - Kabupaten Ende**
   - Code: `180V42,180E10`
   - Source: `psw1`
   - Category: PBB

3. **Pajak Air Tanah - Kabupaten Kupang**
   - Code: `180V82,180G12`
   - Source: `psw2`
   - Category: Pajak Air Tanah

4. **PBB - Kabupaten Kupang**
   - Code: `180V42,180E10`
   - Source: `psw2`
   - Category: PBB

5. **PBB - Kabupaten Flores Timur**
   - Code: `180V42,180E10`
   - Source: `psw3`
   - Category: PBB

---

## Cara Menggunakan:

### 1. Refresh Browser
Setelah migration dan seeder selesai, refresh halaman rekonsiliasi.

### 2. Pilih Jenis Transaksi
Di form rekonsiliasi, Anda akan melihat dropdown "Jenis Transaksi" yang berisi:
- Nama transaksi (contoh: "PBB - Kabupaten Kupang")
- Category dan code di bawahnya (contoh: "PBB - 180V42,180E10")

### 3. Pilih Tanggal
Pilih tanggal transaksi (default: hari ini)

### 4. Klik "Ambil Data"
Source akan otomatis terambil dari data proccode yang dipilih!

---

## Menambah Data Proccode Baru:

### Via Database (Manual):

```sql
INSERT INTO proccodes (code, name, description, source, category, is_active, created_at, updated_at)
VALUES (
    '180V99,180G99',
    'Nama Transaksi Baru',
    'Deskripsi transaksi',
    'psw1',
    'Kategori',
    1,
    NOW(),
    NOW()
);
```

### Via Laravel Tinker:

```bash
php artisan tinker
```

```php
use App\Models\Proccode;

Proccode::create([
    'code' => '180V99,180G99',
    'name' => 'Nama Transaksi Baru',
    'description' => 'Deskripsi transaksi',
    'source' => 'psw1',
    'category' => 'Kategori',
    'is_active' => true,
]);
```

### Via Seeder (Recommended):

Edit file `database/seeders/ProccodeSeeder.php` dan tambahkan data baru, lalu run:

```bash
php artisan db:seed --class=ProccodeSeeder
```

---

## Struktur Tabel Proccode:

| Field | Type | Description |
|-------|------|-------------|
| id | bigint | Primary key |
| code | string | Process code (contoh: 180V82,180G12) |
| name | string | Nama yang ditampilkan di dropdown |
| description | string (nullable) | Deskripsi tambahan |
| source | string | Source/PSW (psw1, psw2, dll) |
| category | string (nullable) | Kategori (PBB, Pajak Air, dll) |
| is_active | boolean | Status aktif (default: true) |
| created_at | timestamp | - |
| updated_at | timestamp | - |

---

## Troubleshooting:

### Migration Error: "Table already exists"
```bash
php artisan migrate:rollback --step=1
php artisan migrate
```

### Dropdown kosong
1. Cek data di database:
```bash
php artisan tinker
```
```php
App\Models\Proccode::count()
App\Models\Proccode::all()
```

2. Jika kosong, run seeder lagi:
```bash
php artisan db:seed --class=ProccodeSeeder
```

### Error "Class 'ProccodeSeeder' not found"
Run composer autoload:
```bash
composer dump-autoload
php artisan db:seed --class=ProccodeSeeder
```

---

## Keuntungan Sistem Baru:

✅ User tidak perlu mengingat code proccode
✅ Source otomatis terisi sesuai proccode
✅ Lebih user-friendly dengan dropdown
✅ Mudah menambah/edit data proccode dari database
✅ Mengurangi human error saat input
✅ Kategorisasi yang jelas (PBB, Pajak Air, dll)

---

## Next Steps (Opsional):

1. **Buat halaman admin untuk manage proccode**
   - CRUD proccode dari UI
   - Aktifkan/non-aktifkan proccode

2. **Grouping dropdown by category**
   - Pisahkan PBB dan Pajak Air dalam group terpisah

3. **Search dalam dropdown**
   - Buat dropdown searchable untuk banyak data

4. **Export data proccode**
   - Export ke Excel/CSV untuk dokumentasi
