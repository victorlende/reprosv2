# Contoh Response API Simulator

Dokumentasi contoh response dari API Simulator untuk berbagai jenis proccode.

## 1. Pajak Air Tanah (180V82,180G12)

### Request:
```json
{
  "proccode": "180V82,180G12",
  "transdate": "20/12/24",
  "psw": "psw1"
}
```

### Response:
```json
{
  "proccode": "180V82,180G12",
  "transdate": "20/12/24",
  "status": "SUKSES",
  "source": "psw1",
  "xdatatemp": [
    {
      "Wisocode": "210",
      "Wdatepost": "20/12/24",
      "Wtxseqnum": "20205793",
      "WRemoteAccNo": "BNTT2740",
      "Wtxamount": "460152",
      "Wproccode": "180V82",
      "Wresponcode": "00",
      "Wtransdate": "20/12/24",
      "Wnarrative": "224056336",
      "Wnarrativepsw1": "4250003598",
      "Wsendbranch": "4033",
      ...
    }
  ]
}
```

### Data Penting:
- `Wtxamount`: Jumlah transaksi pajak air tanah
- `WRemoteAccNo`: Nomor akun terminal
- `Wnarrative`: Nomor referensi transaksi
- `Wsendbranch`: Kode cabang pengirim

---

## 2. PBB (180V42,180E10)

### Request:
```json
{
  "proccode": "180V42,180E10",
  "transdate": "20/12/24",
  "psw": "psw1"
}
```

### Response:
```json
{
  "proccode": "180V42,180E10",
  "transdate": "20/12/24",
  "status": "SUKSES",
  "source": "psw1",
  "xdatatemp": [
    {
      "Wisocode": "210",
      "Wdatepost": "20/12/24",
      "Wtxseqnum": "20206955",
      "WRemoteAccNo": "BNTT3224",
      "Wtxamount": "236500",
      "Wproccode": "180V42",
      "Wresponcode": "00",
      "Wactamount": "236500",
      "Wsendbranch": "4040",
      ...
    }
  ]
}
```

### Data Penting:
- `Wtxamount`: Jumlah PBB yang dibayar
- `Wactamount`: Jumlah aktual pembayaran
- `Wseconddata[17]`: Informasi tunggakan tahun sebelumnya

---

## 3. Proccode Generic/Lainnya

### Request:
```json
{
  "proccode": "TEST123",
  "transdate": "20/12/24",
  "psw": "psw1"
}
```

### Response:
```json
{
  "proccode": "TEST123",
  "transdate": "20/12/24",
  "status": "SUKSES",
  "source": "psw1",
  "xdatatemp": [
    {
      "Wisocode": "210",
      "Wdatepost": "20/12/24",
      "Wtxseqnum": "20201234",
      "WRemoteAccNo": "BNTT5678",
      "Wtxamount": "500000",
      "Wproccode": "TEST123",
      "Wresponcode": "00",
      "Wtransdate": "20/12/24",
      "Wnarrative": "Simulasi transaksi",
      "message": "Data simulasi untuk proccode: TEST123"
    }
  ]
}
```

---

## Field Description

### Field Utama:

| Field | Deskripsi | Contoh |
|-------|-----------|--------|
| `proccode` | Kode proses transaksi | 180V82,180G12 |
| `transdate` | Tanggal transaksi | 20/12/24 |
| `status` | Status transaksi | SUKSES |
| `source` | Source/password request | psw1 |

### Field Detail Transaksi (xdatatemp):

| Field | Deskripsi | Format |
|-------|-----------|--------|
| `Wisocode` | Kode ISO transaksi | String (3 digit) |
| `Wdatepost` | Tanggal posting | dd/mm/yy |
| `Wtxseqnum` | Nomor sequence transaksi | 8 digit number |
| `WRemoteAccNo` | Nomor akun remote/terminal | BNTT + 4 digit |
| `Wtxamount` | Jumlah transaksi | Integer |
| `Wproccode` | Process code aktual | String |
| `Wresponcode` | Response code (00 = sukses) | 2 digit |
| `Wtransdate` | Tanggal transaksi | dd/mm/yy |
| `Wtermid` | Terminal ID | 4 digit |
| `Wsendbranch` | Kode cabang | 4 digit |
| `Wnarrative` | Deskripsi/referensi | String |

---

## Status Codes

| Code | Status | Deskripsi |
|------|--------|-----------|
| 00 | SUKSES | Transaksi berhasil |
| 01 | GAGAL | Transaksi gagal |
| 02 | PENDING | Transaksi pending |

*Note: Simulator selalu mengembalikan status "SUKSES" dan response code "00"*

---

## Response Time

- Simulator memiliki delay **500ms (0.5 detik)** untuk simulasi network latency
- Response time actual API bank bisa bervariasi (5-30 detik)

---

## Testing Scenarios

### Scenario 1: Testing Pajak Air Tanah
```
Proccode: 180V82,180G12
Expected: Data dengan Wsendbranch: 4033
Expected: Wseconddata berisi info PT. FLORES TIRTA RANAKA
```

### Scenario 2: Testing PBB
```
Proccode: 180V42,180E10
Expected: Data dengan Wsendbranch: 4040
Expected: Wseconddata[17] berisi info tunggakan
```

### Scenario 3: Testing Error Handling
```
Proccode: (kosong)
Expected: Validation error
```

---

## Customization

Untuk mengubah data simulator, edit file:
`app/Http/Controllers/ApiSimulatorController.php`

### Method yang bisa dimodifikasi:

- `getPajakAirTanahData()` - Data Pajak Air Tanah
- `getPbbData()` - Data PBB
- `getDefaultData()` - Data default untuk proccode lain
