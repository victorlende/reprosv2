@echo off
echo ========================================
echo Fix Duplicate Code Issue
echo ========================================
echo.

echo [1/3] Running migration to remove unique constraint...
php artisan migrate

echo.
echo [2/3] Clearing config cache...
php artisan config:clear

echo.
echo [3/3] Running seeder (updateOrCreate)...
php artisan db:seed --class=ProccodeSeeder

echo.
echo ========================================
echo Fix Complete!
echo ========================================
echo.
echo Sekarang refresh browser dan coba lagi!
echo.
pause
