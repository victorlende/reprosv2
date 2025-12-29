@echo off
echo ========================================
echo Setup Template System
echo ========================================
echo.

echo [1/5] Running migrations...
php artisan migrate

if %errorlevel% neq 0 (
    echo.
    echo Migration gagal! Cek error di atas.
    pause
    exit /b 1
)

echo.
echo [2/5] Seeding vendors...
php artisan db:seed --class=VendorSeeder

echo.
echo [3/5] Seeding templates...
php artisan db:seed --class=TemplateSeeder

echo.
echo [4/5] Seeding proccodes...
php artisan db:seed --class=ProccodeSeeder

echo.
echo [5/5] Clearing cache...
php artisan config:clear
php artisan cache:clear

echo.
echo ========================================
echo Setup Complete!
========================================
echo.
echo Database telah disetup dengan:
echo - 3 Vendors (Vendor A, B, C)
echo - 4 Templates (PBB A, PBB B, BPHTB A, Pajak Air A)
echo - 5 Proccodes dengan template mapping
echo.
echo Refresh browser dan test aplikasi!
echo.
pause
