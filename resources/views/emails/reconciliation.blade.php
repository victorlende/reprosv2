<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{ $submission->subject }}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="border-bottom: 3px solid #4CAF50; padding-bottom: 10px; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #4CAF50;">DATA REKONSILIASI</h2>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            @if($proccode)
            <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 180px;">Jenis Transaksi</td>
                <td style="padding: 8px 0;">: {{ $proccode->name }}</td>
            </tr>
            @endif
            <tr>
                <td style="padding: 8px 0; font-weight: bold;">Tanggal Kirim</td>
                <td style="padding: 8px 0;">: {{ \Carbon\Carbon::now()->format('d-m-Y H:i') }}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: bold;">Dikirim Oleh</td>
                <td style="padding: 8px 0;">: {{ $submission->user->name }}</td>
            </tr>
        </table>

        @if($submission->body_note)
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #4CAF50; margin-bottom: 20px;">
            <div style="margin: 0;">{!! $submission->body_note !!}</div>
        </div>
        @endif

        <div style="border-top: 1px solid #ddd; padding-top: 15px; margin-top: 20px;">
            <p style="margin: 5px 0;">File terlampir: <strong>{{ $submission->file_name }}</strong></p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee; text-align: center; color: #666;">
            <p style="margin: 5px 0;">Terima kasih.</p>
            <p style="margin: 5px 0; font-weight: bold;">Sistem Rekonsiliasi</p>
        </div>
    </div>
</body>
</html>
