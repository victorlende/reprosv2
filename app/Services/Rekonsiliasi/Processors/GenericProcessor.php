<?php

namespace App\Services\Rekonsiliasi\Processors;

class GenericProcessor implements RekonsiliasiProcessor
{

    public function process(array $rawData, ?array $config = []): array
    {
        // Ensure we extract the relevant array from the raw response
        $data = $rawData['xdatatemp'] 
            ?? $rawData['data']['xdatatemp'] 
            ?? $rawData['data'] 
            ?? [];

        return $data;
    }
}
