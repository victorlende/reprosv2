<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
        }
        h2 {
            text-align: center;
            margin-bottom: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #4CAF50;
            color: white;
            font-weight: bold;
        }
        .text-center {
            text-align: center;
        }
        .text-right {
            text-align: right;
        }
        .total-row {
            background-color: #f0f0f0;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <h2>{{ $title }}</h2>

    <h3>Ringkasan Per Staff</h3>
    <table>
        <thead>
            <tr>
                <th class="text-center">No</th>
                <th>Nama Staff</th>
                <th class="text-center">Total Pengiriman</th>
                <th class="text-center">Berhasil</th>
                <th class="text-center">Gagal</th>
            </tr>
        </thead>
        <tbody>
            @php
                $totalAll = 0;
                $totalSent = 0;
                $totalFailed = 0;
            @endphp
            @foreach($reportData as $index => $data)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ $data['user_name'] }}</td>
                    <td class="text-center">{{ $data['total'] }}</td>
                    <td class="text-center">{{ $data['sent'] }}</td>
                    <td class="text-center">{{ $data['failed'] }}</td>
                </tr>
                @php
                    $totalAll += $data['total'];
                    $totalSent += $data['sent'];
                    $totalFailed += $data['failed'];
                @endphp
            @endforeach
            <tr class="total-row">
                <td colspan="2" class="text-center">TOTAL</td>
                <td class="text-center">{{ $totalAll }}</td>
                <td class="text-center">{{ $totalSent }}</td>
                <td class="text-center">{{ $totalFailed }}</td>
            </tr>
        </tbody>
    </table>

    <h3 style="margin-top: 30px;">Detail Pengiriman</h3>
    <table>
        <thead>
            <tr>
                <th class="text-center">No</th>
                <th>Tanggal Kirim</th>
                <th>Staff</th>
                <th>Jenis Transaksi</th>
                <th>Email Tujuan</th>
                <th>File</th>
                <th class="text-center">Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($submissions as $index => $submission)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ $submission->sent_at ? $submission->sent_at->format('d-m-Y H:i') : '-' }}</td>
                    <td>{{ $submission->user->name }}</td>
                    <td>{{ $submission->proccode->name }}</td>
                    <td>{{ $submission->emailDestination->email }}</td>
                    <td>{{ $submission->file_name }}</td>
                    <td class="text-center">{{ strtoupper($submission->status) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
