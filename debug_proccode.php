<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$p = App\Models\Proccode::where('code', '180V42')->first();
if ($p) {
    echo "Proccode: " . $p->name . "\n";
    if ($p->template) {
        echo "Template ID: " . $p->template->id . "\n";
        echo "Template Name: " . $p->template->name . "\n";
        echo "Processor Class in DB: '" . $p->template->processor_class . "'\n";
        
        $className = $p->template->processor_class;
        if (class_exists($className)) {
             echo "Class Exists: YES\n";
        } else {
             echo "Class Exists: NO\n";
        }
    } else {
        echo "No Template linked.\n";
    }
} else {
    echo "Proccode 180V42 not found.\n";
}
