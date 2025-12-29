<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ApiService
{
    protected $apiUrl;
    protected $apiUrlTot24;

    public function __construct()
    {
        // Prioritize config, fallback to localhost simulation if config is missing
        $this->apiUrl = config('services.bank_api.url') ?? 'http://localhost:3000';
        // $this->apiUrl = 'http://localhost:3000'; // Temporary override for Node.js Simulation
        $this->apiUrlTot24 = 'http://localhost:3001/tot24'; // API TOT24 Simulator
    }

    public function checkConnection()
    {
        if (empty($this->apiUrl)) {
            return [
                'success' => false,
                'message' => 'Belum ada environment yang dipilih.'
            ];
        }

        try {
            // Try a simple connection check (HEAD or GET)
            // We use a short timeout because we just want to know if it's reachable
            Http::timeout(3)->get($this->apiUrl);
            
            // Even if it returns 404, 405, 500, etc., the connection was successful
            return [
                'success' => true,
                'message' => 'Terhubung ke API'
            ];

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('API Connection Check Failed: Connection Refused', ['error' => $e->getMessage()]);
             return [
                'success' => false,
                'message' => 'Gagal terhubung ke API Server. Pastikan service API (Node.js) berjalan.'
            ];
        } catch (\Exception $e) {
            Log::error('API Connection Check Failed: General Exception', ['error' => $e->getMessage()]);
             return [
                'success' => false,
                'message' => 'Gagal terhubung: ' . $e->getMessage()
            ];
        }
    }

    public function callApi(string $proccode, string $tanggal, string $source)
    {
        if (empty($this->apiUrl)) {
            return [
                'success' => false,
                'message' => 'Belum ada environment yang dipilih.'
            ];
        }

        try {
            $data = [
                'proccode'  => $proccode,
                'transdate' => $tanggal,
                'psw'       => $source
            ];

            $sha256Hash = hash('sha256', json_encode($data));

            $response = Http::timeout(30)
                ->withHeaders([
                    'Authorization' => $sha256Hash,
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ])
                ->post($this->apiUrl, $data);

            if ($response->successful()) {
                Log::info('API Request Success', [
                    'proccode' => $proccode,
                    'data_count' => count($response->json()['xdatatemp'] ?? $response->json()['data'] ?? [])
                ]);
                return [
                    'success' => true,
                    'data' => $response->json(),
                    'message' => 'Data berhasil diambil'
                ];
            }

            Log::error('API Request Failed', [
                'proccode' => $proccode,
                'transdate' => $tanggal,
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            return [
                'success' => false,
                'message' => 'API Error: ' . $response->status(),
                'error' => $response->body()
            ];

        } catch (\Exception $e) {
            Log::error('API Call Exception: ' . $e->getMessage(), [
                'proccode' => $proccode,
                'transdate' => $tanggal
            ]);

            return [
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ];
        }
    }

    public function checkTransactionStatus(string $type, string $key, string $tanggal)
    {
        if (empty($this->apiUrlTot24)) {
            return [
                'success' => false,
                'message' => 'API TOT24 URL tidak dikonfigurasi.'
            ];
        }

        try {
            $data = [
                'type'      => $type,
                'key'       => $key,
                'transdate' => $tanggal,
                'psw'       => 'pswsrv',
                'xtable'    => 'roumtpsw'
            ];

            $sha256Hash = hash('sha256', json_encode($data));

            $response = Http::timeout(30)
                ->withHeaders([
                    'Authorization' => $sha256Hash,
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ])
                ->post($this->apiUrlTot24, $data);

            if ($response->successful()) {
                $responseData = $response->json();

                Log::info('API Check Status Success', [
                    'type' => $type,
                    'key' => $key,
                    'data_count' => count($responseData['xdatatemp'] ?? [])
                ]);

                // Return xdatatemp array directly for frontend consumption
                return [
                    'success' => true,
                    'data' => $responseData['xdatatemp'] ?? [],
                    'meta' => [
                        'type' => $responseData['type'] ?? $type,
                        'key' => $responseData['key'] ?? $key,
                        'transdate' => $responseData['transdate'] ?? $tanggal,
                        'status' => $responseData['status'] ?? 'UNKNOWN',
                        'psw' => $responseData['psw'] ?? 'pswsrv',
                        'xtable' => $responseData['xtable'] ?? 'roumtpsw'
                    ],
                    'message' => 'Data ditemukan'
                ];
            }

            Log::error('API Check Status Failed', [
                'type' => $type,
                'key' => $key,
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            return [
                'success' => false,
                'message' => 'API Error: ' . $response->status(),
                'error' => $response->body()
            ];

        } catch (\Exception $e) {
            Log::error('API Check Status Exception: ' . $e->getMessage(), [
                'type' => $type,
                'key' => $key
            ]);

            return [
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ];
        }
    }
}
