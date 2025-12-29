<?php

namespace App\Services\Rekonsiliasi\Processors;

class AtmCimbProcessor implements RekonsiliasiProcessor
{
    public function process(array $rawData, ?array $config = []): array
    {
        $xdatatemp = $rawData['xdatatemp'] 
            ?? $rawData['data']['xdatatemp'] 
            ?? $rawData['data'] 
            ?? [];

        if (empty($xdatatemp)) {
            return [];
        }

        $processedData = [];
        $i = 0;
        
        \Illuminate\Support\Facades\Log::info("AtmCimbProcessor Start: count=" . count($xdatatemp));

        foreach ($xdatatemp as $data) {

            $data = (object) $data;

          //  if (isset($data->Wresponcode) && in_array($data->Wresponcode, ['00'])) {
                
                $inputSeconds = (int)($data->Wtranstime ?? 0);
                
                $amount = (float)($data->Wactamount ?? $data->Wtxamount ?? 0);
                $wFirstData8 = $data->Wfirstdata[8] ?? ''; 
                 
                $hours = floor($inputSeconds / 3600);
                $minutes = floor(($inputSeconds % 3600) / 60);
                $seconds = $inputSeconds % 60;
                $timeFormat = sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds);

                $wSecondData2 = $data->Wseconddata[2] ?? '';
                $wSecondData11 = $data->Wseconddata[11] ?? '';
                $watmlongdata = $data->atmlongdata ?? '';
                
                $row = [
                    'Wresponcode'   => $data->Wresponcode ?? '', // Pass original response code for frontend validation
                    'kode_bayar'    => substr($wSecondData2, 22, 20),
                    'nama_mp'       => substr($watmlongdata, 381, 25),
                    'tanggal'       => $data->Wtransdate ?? '',
                    'waktu'         => $timeFormat,
                    'amount'        => $amount, // Keep as number for frontend formatting
                    'seq_num'       => $data->Wtxseqnum ?? '',
                    'narrative'     => $data->Wnarrative ?? '',
                    'channel_code'  => $wFirstData8,
                    'raw_source'    => $data, // Keep raw data if needed
                ];

                $processedData[] = $row;
                $i++;
           // }
        }

        if (!empty($processedData)) {
            \Illuminate\Support\Facades\Log::info("AtmCimbProcessor Result (First Item):", (array)$processedData[0]);
        } else {
             \Illuminate\Support\Facades\Log::info("AtmCimbProcessor Result: Empty");
        }

        return $processedData;
    }
}