<?php

namespace App\Services\Rekonsiliasi\Processors;

use Illuminate\Support\Facades\Log;

class RetribusiTtsMbaProcessor implements RekonsiliasiProcessor
{
    public function process(array $rawData, ?array $config = []): array
    {
        // $rawData constains the full API response
        // Implement your logic here
        
        $results = [];
        
        // Example:
        // $items = $rawData['data'] ?? [];
        // foreach ($items as $item) {
        //     $results[] = [
        //         'col1' => $item['field1'],
        //         'col2' => $item['field2'],
        //     ];
        // }

        return $results;
    }
}