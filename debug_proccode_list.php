<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$proccodes = App\Models\Proccode::all();
foreach ($proccodes as $p) {
    echo "ID: " . $p->id . " | Code: '" . $p->code . "' | Name: " . $p->name . "\n";
}
