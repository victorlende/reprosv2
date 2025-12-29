<?php

namespace App\Services\Rekonsiliasi\Processors;

interface RekonsiliasiProcessor
{
    public function process(array $rawData, ?array $config = []): array;
}
