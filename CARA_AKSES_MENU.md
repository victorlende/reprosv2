# Cara Mengakses Menu Rekonsiliasi Bank

## Langkah-langkah:

### 1. Pastikan Server Berjalan

Buka 2 terminal:

**Terminal 1 - Laravel:**
```bash
cd C:\Users\bpdntt\Herd\reprosv2
php artisan serve
# Atau jika menggunakan Herd:
# Herd sudah otomatis serve, akses di http://reprosv2.test
```

**Terminal 2 - Vite (Frontend):**
```bash
cd C:\Users\bpdntt\Herd\reprosv2
npm run dev
```

### 2. Buka Browser

Akses salah satu URL ini:
- http://localhost:8000 (jika pakai `php artisan serve`)
- http://reprosv2.test (jika pakai Laravel Herd)

### 3. Register/Login

Jika belum punya akun:
1. Klik tombol **Register** (di pojok kanan atas)
2. Isi form registrasi
3. Klik **Register**
4. Login dengan akun yang baru dibuat

Jika sudah punya akun:
1. Klik tombol **Login** (di pojok kanan atas)
2. Masukkan email dan password
3. Klik **Login**

### 4. Lihat Sidebar

Setelah login, Anda akan melihat sidebar di sebelah kiri dengan menu:
- **Dashboard** (icon grid)
- **Rekonsiliasi Bank** (icon receipt) ← MENU INI

### 5. Klik Menu Rekonsiliasi Bank

Klik menu "Rekonsiliasi Bank" di sidebar, dan Anda akan diarahkan ke halaman rekonsiliasi.

## Troubleshooting

### Menu tidak muncul?

**Penyebab 1: Belum Login**
- Menu hanya muncul untuk user yang sudah login
- Solusi: Login terlebih dahulu

**Penyebab 2: Vite belum compile**
- Frontend code belum ter-compile
- Solusi: Jalankan `npm run dev` dan tunggu sampai selesai

**Penyebab 3: Cache browser**
- Browser masih menyimpan versi lama
- Solusi: Hard refresh (Ctrl+Shift+R atau Ctrl+F5)

**Penyebab 4: Sidebar collapsed**
- Sidebar mungkin dalam mode collapsed
- Solusi: Klik icon hamburger untuk expand sidebar

### Cara Cepat Test

Jika Anda sudah login, coba akses langsung:
```
http://localhost:8000/rekonsiliasi
```
atau
```
http://reprosv2.test/rekonsiliasi
```

Jika halaman terbuka, berarti route sudah benar dan menu seharusnya ada di sidebar.

## Lokasi Menu di Sidebar

Posisi menu:
```
┌─────────────────────┐
│   [Logo]            │
├─────────────────────┤
│ Platform            │
│ ☐ Dashboard         │
│ 📄 Rekonsiliasi Bank│ ← DI SINI
├─────────────────────┤
│                     │
│ (footer menu)       │
└─────────────────────┘
```

## Screenshot Reference

Menu "Rekonsiliasi Bank" akan muncul dengan:
- Icon: Receipt (📄)
- Teks: "Rekonsiliasi Bank"
- Posisi: Di bawah menu Dashboard

Saat diklik, akan membuka halaman dengan:
- Toggle "Mode Simulator" (warna kuning/amber)
- Form dengan 3 field: Process Code, Tanggal, Source/PSW
- Tombol "Ambil Data"
