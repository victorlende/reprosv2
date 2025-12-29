@echo off
echo ========================================
echo Setup Database PostgreSQL
echo ========================================
echo.

echo PENTING: Pastikan Anda sudah:
echo 1. Install PostgreSQL
echo 2. Buat database 'rekonsiliasi_bank'
echo 3. Update DB_PASSWORD di file .env
echo.

set /p continue="Sudah selesai setup di atas? (y/n): "
if /i not "%continue%"=="y" (
    echo.
    echo Setup dibatalkan.
    echo Silakan ikuti panduan di SETUP_POSTGRESQL.md
    pause
    exit
)

echo.
echo [1/3] Clearing config cache...
php artisan config:clear

echo.
echo [2/3] Running migrations...
php artisan migrate --force

if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo ERROR: Migration gagal!
    echo ========================================
    echo.
    echo Kemungkinan penyebab:
    echo 1. Database belum dibuat
    echo 2. Password salah di .env
    echo 3. PostgreSQL service tidak berjalan
    echo.
    echo Silakan cek SETUP_POSTGRESQL.md untuk troubleshooting
    pause
    exit /b 1
)

echo.
echo [3/3] Running seeder...
php artisan db:seed --class=ProccodeSeeder --force

if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo WARNING: Seeder gagal!
    echo ========================================
    echo.
    echo Migration sudah berhasil, tapi seeder gagal.
    echo Anda bisa run manual: php artisan db:seed --class=ProccodeSeeder
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Database Berhasil!
echo ========================================
echo.
echo Database sudah siap digunakan dengan 5 data proccode:
echo 1. Pajak Air Tanah - Kabupaten Manggarai
echo 2. PBB - Kabupaten Ende
echo 3. Pajak Air Tanah - Kabupaten Kupang
echo 4. PBB - Kabupaten Kupang
echo 5. PBB - Kabupaten Flores Timur
echo.
echo Silakan refresh browser dan coba aplikasi!
echo.
pause
