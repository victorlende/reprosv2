# Quick Start - API Simulator

Panduan cepat untuk mencoba aplikasi rekonsiliasi dengan mode simulator.

## Langkah-langkah:

### 1. Setup Database (Jika Belum)

```bash
# Generate app key
php artisan key:generate

# Run migration
php artisan migrate
```

### 2. Jalankan Development Server

```bash
# Terminal 1 - Laravel
php artisan serve

# Terminal 2 - Vite (Frontend)
npm run dev
```

### 3. Register & Login

1. Buka browser: `http://localhost:8000`
2. Register akun baru
3. Verify email jika diperlukan
4. Login ke aplikasi

### 4. Akses Menu Rekonsiliasi

1. Klik menu "Rekonsiliasi Bank" di sidebar (icon Receipt)
2. Toggle "Mode Simulator" akan aktif secara default

### 5. Testing dengan Simulator

#### Test 1: Pajak Air Tanah

```
Process Code: 180V82,180G12
Tanggal: 2024-12-20 (atau tanggal apa saja)
Source/PSW: psw1
```

Klik "Ambil Data" - Anda akan melihat data JSON untuk transaksi Pajak Air Tanah

#### Test 2: PBB

```
Process Code: 180V42,180E10
Tanggal: 2024-12-20
Source/PSW: psw1
```

Klik "Ambil Data" - Anda akan melihat data JSON untuk transaksi PBB

#### Test 3: Proccode Lain

```
Process Code: TEST123
Tanggal: 2024-12-20
Source/PSW: psw1
```

Klik "Ambil Data" - Akan mengembalikan data default/generic

## Penjelasan Data JSON

Response dari simulator berisi:

- `proccode`: Kode proses yang diminta
- `transdate`: Tanggal transaksi
- `status`: Status transaksi (selalu "SUKSES" di simulator)
- `source`: Source/password yang digunakan
- `xdatatemp`: Array berisi detail transaksi
  - `Wtxseqnum`: Nomor sequence transaksi (random)
  - `WRemoteAccNo`: Nomor akun remote
  - `Wtxamount`: Jumlah transaksi (random 100.000 - 999.999)
  - Dan field lainnya sesuai dengan struktur API bank

## Mematikan Simulator (Gunakan API Asli)

1. Toggle off "Mode Simulator"
2. Pastikan `BANK_API_URL` sudah diisi di file `.env`:
   ```
   BANK_API_URL=https://api-bank-anda.com/endpoint
   ```
3. Submit form - Request akan dikirim ke API bank asli

## Tips

- Simulator tidak memerlukan konfigurasi API URL
- Data yang dihasilkan bersifat random untuk testing
- Gunakan simulator untuk development dan testing fitur
- Switch ke API asli ketika siap untuk production testing

## File Simulator

- Controller: `app/Http/Controllers/ApiSimulatorController.php`
- Route: `routes/web.php` (route: `api.simulator`)
- Frontend: `resources/js/Pages/rekonsiliasi/index.tsx`

## Troubleshooting Simulator

**Q: Data tidak muncul?**
- Pastikan toggle "Mode Simulator" aktif
- Check console browser untuk error
- Pastikan server Laravel dan Vite berjalan

**Q: Ingin customize data simulator?**
- Edit file `app/Http/Controllers/ApiSimulatorController.php`
- Modify method `getPajakAirTanahData()` atau `getPbbData()`
- Data akan langsung berubah tanpa perlu restart

**Q: Bagaimana menambah proccode baru?**
- Edit `ApiSimulatorController.php`
- Tambahkan condition di method `simulate()`
- Buat method baru untuk data template proccode tersebut

## Next Steps

Setelah testing dengan simulator berhasil:

1. Integrate dengan API bank asli
2. Tambahkan fitur export data (Excel/PDF)
3. Buat tampilan tabel untuk data transaksi
4. Implementasi filter dan pencarian
5. Tambahkan fitur perbandingan/rekonsiliasi data
