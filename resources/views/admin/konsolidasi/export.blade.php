<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body>
    <table>
        <thead>
            <tr>
                <th colspan="{{ 1 + (count($proccodes) * 2) + 2 }}" style="text-align: center; font-size: 16px; font-weight: bold;">
                    Laporan Konsolidasi Transaksi per Kabupaten
                </th>
            </tr>
            <tr>
                <th colspan="{{ 1 + (count($proccodes) * 2) + 2 }}" style="text-align: center; font-size: 12px; font-style: italic;">
                    Tanggal Export: {{ now()->format('d-m-Y H:i') }}
                </th>
            </tr>
            <tr></tr>
            <tr>
                <th rowspan="2" style="border: 1px solid #000; font-weight: bold; vertical-align: middle; text-align: center;">KABUPATEN</th>
                @foreach($proccodes as $p)
                    <th colspan="2" style="border: 1px solid #000; font-weight: bold; text-align: center;">{{ $p->name }}</th>
                @endforeach
                <th colspan="2" style="border: 1px solid #000; font-weight: bold; text-align: center;">TOTAL REALISASI</th>
            </tr>
            <tr>
                @foreach($proccodes as $p)
                    <th style="border: 1px solid #000; font-weight: bold; text-align: center;">Transaksi</th>
                    <th style="border: 1px solid #000; font-weight: bold; text-align: center;">Nominal</th>
                @endforeach
                <th style="border: 1px solid #000; font-weight: bold; text-align: center;">Transaksi</th>
                <th style="border: 1px solid #000; font-weight: bold; text-align: center;">Nominal</th>
            </tr>
        </thead>
        <tbody>
            @php
                $grandTotalTrx = 0;
                $grandTotalNominal = 0;
                $colTotals = [];
                foreach($proccodes as $p) {
                    $colTotals[$p->id] = ['trx' => 0, 'nominal' => 0];
                }
            @endphp

            @foreach($districts as $district)
                @php
                    $rowTrx = 0;
                    $rowNominal = 0;
                @endphp
                <tr>
                    <td style="border: 1px solid #000;">{{ $district->name }}</td>
                    
                    @foreach($proccodes as $p)
                        @php
                            $key = "{$district->id}_{$p->id}";
                            $cell = $matrix[$key] ?? ['trx' => 0, 'nominal' => 0];
                            
                            $rowTrx += $cell['trx'];
                            $rowNominal += $cell['nominal'];

                            // Add to column totals
                            $colTotals[$p->id]['trx'] += $cell['trx'];
                            $colTotals[$p->id]['nominal'] += $cell['nominal'];
                        @endphp
                        <td style="border: 1px solid #000; text-align: center;">{{ $cell['trx'] ?: '-' }}</td>
                        <td style="border: 1px solid #000; text-align: right;">{{ $cell['nominal'] ? number_format($cell['nominal'], 0, ',', '.') : '-' }}</td>
                    @endforeach

                    @php
                        $grandTotalTrx += $rowTrx;
                        $grandTotalNominal += $rowNominal;
                    @endphp

                    <td style="border: 1px solid #000; text-align: center; font-weight: bold; background-color: #f2f2f2;">{{ $rowTrx }}</td>
                    <td style="border: 1px solid #000; text-align: right; font-weight: bold; background-color: #f2f2f2;">{{ number_format($rowNominal, 0, ',', '.') }}</td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <td style="border: 1px solid #000; font-weight: bold; text-align: right;">TOTAL KESELURUHAN</td>
                @foreach($proccodes as $p)
                    <td style="border: 1px solid #000; font-weight: bold; text-align: center;">{{ $colTotals[$p->id]['trx'] }}</td>
                    <td style="border: 1px solid #000; font-weight: bold; text-align: right;">{{ number_format($colTotals[$p->id]['nominal'], 0, ',', '.') }}</td>
                @endforeach
                <td style="border: 1px solid #000; font-weight: bold; text-align: center; background-color: #d9d9d9;">{{ $grandTotalTrx }}</td>
                <td style="border: 1px solid #000; font-weight: bold; text-align: right; background-color: #d9d9d9;">{{ number_format($grandTotalNominal, 0, ',', '.') }}</td>
            </tr>
        </tfoot>
    </table>
</body>
</html>
