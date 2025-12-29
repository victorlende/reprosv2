@echo off
echo ========================================
echo Setup Proccode Dropdown
echo ========================================
echo.

echo [1/2] Running migration...
php artisan migrate --force
echo.

echo [2/2] Running seeder...
php artisan db:seed --class=ProccodeSeeder --force
echo.

echo ========================================
echo Setup complete!
echo ========================================
echo.
echo Now you can:
echo 1. Refresh your browser
echo 2. Select transaction type from dropdown
echo 3. The source will be automatically selected
echo.
pause
