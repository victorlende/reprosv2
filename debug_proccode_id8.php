<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$p = App\Models\Proccode::find(8);
if ($p) {
    echo "Proccode ID 8:\n";
    echo "Code: '" . $p->code . "'\n";
    echo "Source: '" . $p->source . "'\n";
    echo "Name: '" . $p->name . "'\n";
    echo "Template ID: " . $p->template_id . "\n";
    
    if ($p->template) {
        echo "Template Name: " . $p->template->name . "\n";
        echo "Processor Class: " . $p->template->processor_class . "\n";
    } else {
        echo "No Template Relation Found.\n";
    }
} else {
    echo "Proccode ID 8 not found.\n";
}
