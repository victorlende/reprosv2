# Aplikasi Rekonsiliasi Bank

Aplikasi untuk melakukan rekonsiliasi data bank dengan mengambil data melalui API.

## Fitur yang Telah Dibuat

1. **Service Layer** - ApiService untuk menangani komunikasi dengan API bank
2. **Controller** - RekonsiliasiBankController untuk mengelola request rekonsiliasi
3. **Route** - Route untuk halaman rekonsiliasi dan fetch data API
4. **Frontend** - Halaman React untuk interface rekonsiliasi
5. **Navigasi** - Menu "Rekonsiliasi Bank" di sidebar

## Struktur File

### Backend (Laravel)

- `app/Services/ApiService.php` - Service untuk call API bank
- `app/Http/Controllers/RekonsiliasiBankController.php` - Controller rekonsiliasi
- `routes/web.php` - Route definition untuk rekonsiliasi
- `config/services.php` - Konfigurasi API URL

### Frontend (React/TypeScript)

- `resources/js/Pages/rekonsiliasi/index.tsx` - Halaman utama rekonsiliasi
- `resources/js/routes/index.ts` - Route helper functions
- `resources/js/components/app-sidebar.tsx` - Navigasi sidebar

## Konfigurasi

### 1. Setup Environment

Tambahkan URL API bank ke file `.env`:

```bash
BANK_API_URL=https://api-bank-anda.com/endpoint
```

Contoh dapat dilihat di file `.env.example`

### 2. Install Dependencies

```bash
# Install PHP dependencies
composer install

# Install Node dependencies
npm install
```

### 3. Generate Application Key

```bash
php artisan key:generate
```

### 4. Run Migration (jika diperlukan)

```bash
php artisan migrate
```

### 5. Build Assets

```bash
# Development
npm run dev

# Production
npm run build
```

## Cara Menggunakan

1. Login ke aplikasi
2. Klik menu "Rekonsiliasi Bank" di sidebar
3. Isi form dengan data yang diperlukan:
   - **Process Code**: Kode proses transaksi
   - **Tanggal Transaksi**: Tanggal transaksi yang akan direkonsiliasi
   - **Source/PSW**: Password/source untuk autentikasi
4. Klik tombol "Ambil Data"
5. Data JSON dari API akan ditampilkan di bawah form

## Format API Request

API akan mengirim POST request dengan format:

```json
{
  "proccode": "KODE_PROSES",
  "transdate": "2024-12-20",
  "psw": "SOURCE_PASSWORD"
}
```

Header yang dikirim:
- `Authorization`: SHA-256 hash dari JSON body
- `Accept`: application/json
- `Content-Type`: application/json

## Format API Response

API diharapkan mengembalikan response dalam format JSON:

```json
{
  "status": "success",
  "data": {
    // data transaksi
  }
}
```

## Mode Simulator

Aplikasi dilengkapi dengan **API Simulator** untuk testing tanpa perlu koneksi ke API bank asli.

### Fitur Simulator:

- Menghasilkan data dummy berdasarkan template dari `isijson.txt`
- Mendukung proccode: `180V82,180G12` (Pajak Air Tanah) dan `180V42,180E10` (PBB)
- Data random untuk testing yang lebih realistis
- Delay 0.5 detik untuk simulasi network latency

### Cara Menggunakan Simulator:

1. Di halaman Rekonsiliasi, aktifkan toggle "Mode Simulator"
2. Isi form dengan data:
   - **Process Code**: `180V82,180G12` atau `180V42,180E10`
   - **Tanggal**: Pilih tanggal transaksi
   - **Source/PSW**: Masukkan value apa saja (contoh: `psw1`)
3. Klik "Ambil Data"
4. Simulator akan mengembalikan data JSON sesuai dengan proccode yang dipilih

### Contoh Proccode:

- `180V82,180G12` - Data Pajak Air Tanah
- `180V42,180E10` - Data PBB (Pajak Bumi dan Bangunan)

### Testing Production API:

Jika ingin testing dengan API bank asli:
1. Matikan toggle "Mode Simulator"
2. Pastikan `BANK_API_URL` sudah dikonfigurasi di `.env`
3. Isi form dan submit

## Security

- API call menggunakan SHA-256 hash untuk Authorization header
- Route dilindungi dengan middleware `auth` dan `verified`
- CSRF protection enabled untuk semua POST request
- Request validation untuk semua input

## Troubleshooting

### API URL tidak dikonfigurasi
Error: "Belum ada environment yang dipilih"
- Solusi: Pastikan `BANK_API_URL` sudah diisi di file `.env`

### Timeout Error
- Default timeout: 30 detik
- Jika API membutuhkan waktu lebih lama, edit timeout di `app/Services/ApiService.php` baris 30

### CORS Error
- Pastikan API bank mengizinkan request dari domain aplikasi Anda
- Hubungi administrator API untuk whitelist domain

## Development

### Menambahkan Field Baru

1. Update form di `resources/js/Pages/rekonsiliasi/index.tsx`
2. Update validation di `app/Http/Controllers/RekonsiliasiBankController.php`
3. Update parameter di `app/Services/ApiService.php`

### Menampilkan Data dalam Tabel

Saat ini data ditampilkan dalam format JSON. Untuk menampilkan dalam bentuk tabel:

1. Parse response JSON di frontend
2. Buat component Table untuk menampilkan data
3. Map data ke dalam rows dan columns

## Lisensi

Aplikasi ini dibuat untuk keperluan internal bank.
