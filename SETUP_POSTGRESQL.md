# Setup PostgreSQL untuk Aplikasi Rekonsiliasi Bank

## Langkah 1: Install PostgreSQL

### Jika Belum Terinstall:

Download dan install PostgreSQL dari:
https://www.postgresql.org/download/windows/

**Catatan penting saat install:**
- Catat password untuk user `postgres` yang Anda buat
- Default port: 5432

### Jika Sudah Terinstall:

Pastikan PostgreSQL service berjalan:
1. Buka Services (tekan Win+R, ketik `services.msc`)
2. Cari "postgresql-x64-XX"
3. Pastikan status "Running"

---

## Langkah 2: Buat Database

### Via pgAdmin (GUI):

1. Buka pgAdmin
2. Connect ke PostgreSQL server
3. Klik kanan pada "Databases" → Create → Database
4. Nama database: `rekonsiliasi_bank`
5. Klik Save

### Via Command Line (psql):

```bash
# Login sebagai postgres
psql -U postgres

# Buat database
CREATE DATABASE rekonsiliasi_bank;

# Keluar
\q
```

### Via SQL Query:

```sql
CREATE DATABASE rekonsiliasi_bank
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    CONNECTION LIMIT = -1;
```

---

## Langkah 3: Update File .env

File `.env` sudah diupdate dengan konfigurasi PostgreSQL:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=rekonsiliasi_bank
DB_USERNAME=postgres
DB_PASSWORD=
```

**PENTING:** Isi `DB_PASSWORD` dengan password PostgreSQL Anda!

Edit file `.env` dan ubah:
```env
DB_PASSWORD=password_postgres_anda
```

---

## Langkah 4: Run Migration & Seeder

Setelah database dibuat dan `.env` dikonfigurasi, jalankan:

### Windows Command Prompt:

```bash
cd C:\Users\bpdntt\Herd\reprosv2

# Jalankan migration
php artisan migrate

# Jalankan seeder
php artisan db:seed --class=ProccodeSeeder
```

### Atau gunakan batch file:

Double click file `setup-proccode.bat` yang sudah dibuat.

---

## Troubleshooting

### Error: "could not connect to server"

**Penyebab:** PostgreSQL service tidak berjalan

**Solusi:**
1. Buka Services (`services.msc`)
2. Cari "postgresql"
3. Start service

### Error: "password authentication failed"

**Penyebab:** Password salah di file `.env`

**Solusi:**
1. Cek password PostgreSQL Anda
2. Update `DB_PASSWORD` di file `.env`
3. Run `php artisan config:clear`

### Error: "database does not exist"

**Penyebab:** Database belum dibuat

**Solusi:**
Buat database menggunakan salah satu cara di Langkah 2

### Error: "driver not found"

**Penyebab:** PHP PostgreSQL extension belum aktif

**Solusi:**
1. Buka `php.ini`
2. Uncomment: `;extension=pdo_pgsql` → `extension=pdo_pgsql`
3. Uncomment: `;extension=pgsql` → `extension=pgsql`
4. Restart web server

---

## Verifikasi Setup

### Test Koneksi Database:

```bash
php artisan tinker
```

```php
DB::connection()->getPdo();
// Jika sukses, akan muncul object PDO
```

### Cek Tabel:

```bash
php artisan tinker
```

```php
use App\Models\Proccode;
Proccode::count();
// Harus return: 5
```

### Cek Data:

```php
Proccode::all();
// Harus menampilkan 5 data proccode
```

---

## Struktur Database Setelah Migration

Tabel yang akan dibuat:

1. **proccodes** - Data proccode untuk dropdown
2. **users** - User authentication
3. **sessions** - Session management
4. **cache** - Cache storage
5. **jobs** - Queue jobs
6. **password_reset_tokens** - Password reset

---

## Konfigurasi Alternatif

### Jika Menggunakan Docker PostgreSQL:

```env
DB_CONNECTION=pgsql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=rekonsiliasi_bank
DB_USERNAME=postgres
DB_PASSWORD=secret
```

### Jika PostgreSQL di Server Lain:

```env
DB_CONNECTION=pgsql
DB_HOST=192.168.1.100  # IP server PostgreSQL
DB_PORT=5432
DB_DATABASE=rekonsiliasi_bank
DB_USERNAME=postgres
DB_PASSWORD=your_password
```

---

## Next Steps

Setelah setup selesai:

1. ✅ Refresh browser Anda
2. ✅ Login ke aplikasi
3. ✅ Klik menu "Rekonsiliasi Bank"
4. ✅ Dropdown "Jenis Transaksi" sudah terisi dengan 5 data
5. ✅ Pilih salah satu dan test simulator

---

## Backup & Restore

### Backup Database:

```bash
pg_dump -U postgres rekonsiliasi_bank > backup.sql
```

### Restore Database:

```bash
psql -U postgres rekonsiliasi_bank < backup.sql
```

---

## Tambahan: pgAdmin Recommended Settings

**Host:** localhost
**Port:** 5432
**Maintenance database:** postgres
**Username:** postgres
**Password:** (password Anda)
**Save password:** Yes
