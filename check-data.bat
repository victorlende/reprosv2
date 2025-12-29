@echo off
echo ========================================
echo Check Database Data
echo ========================================
echo.

echo Checking proccodes table...
php artisan tinker --execute="echo 'Total proccodes: ' . App\Models\Proccode::count(); echo PHP_EOL; App\Models\Proccode::all(['id', 'name', 'code', 'source'])->each(function(\$p) { echo \$p->id . ' - ' . \$p->name . ' (' . \$p->code . ') - Source: ' . \$p->source . PHP_EOL; });"

echo.
pause
