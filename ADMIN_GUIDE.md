# Admin Panel - Panduan Penggunaan

## Akses Menu Admin

Setelah login, Anda akan menemukan menu **"Admin"** di sidebar dengan 3 submenu:
- **Vendors** - Kelola data vendor sistem
- **Templates** - Kelola mapping template untuk setiap vendor
- **Proccodes** - Kelola data proccode dan hubungkan dengan template

---

## 1. Manage Vendors

**Path**: `/admin/vendors`

### Fungsi:
Kelola vendor penyedia sistem (Vendor A, B, C, dll)

### Cara Menambah Vendor Baru:

1. Klik tombol **"Tambah Vendor"**
2. Isi form:
   - **Nama Vendor** *: Contoh: "Vendor A - Core System"
   - **Code Vendor** *: Contoh: "vendor_a" (harus unik, lowercase, underscore)
   - **Deskripsi**: Keterangan vendor (opsional)
   - **Status Aktif**: Toggle ON untuk mengaktifkan vendor
3. Klik **"Simpan"**

### Cara Edit Vendor:

1. Klik icon **Pencil** di kolom Aksi
2. Update data yang diperlukan
3. Klik **"Simpan"**

### Cara Hapus Vendor:

1. Klik icon **Trash** di kolom Aksi
2. Konfirmasi hapus

**⚠️ Warning**: Menghapus vendor akan menghapus semua template yang terkait!

---

## 2. Manage Templates

**Path**: `/admin/templates`

### Fungsi:
Kelola mapping kolom tabel untuk setiap kategori pajak per vendor

### Cara Menambah Template Baru:

1. Klik tombol **"Tambah Template"**
2. Isi **Basic Info**:
   - **Vendor** *: Pilih vendor dari dropdown
   - **Kategori** *: Contoh: "PBB", "BPHTB", "Pajak Daerah"
   - **Nama Template** *: Contoh: "Template PBB Vendor A"
   - **Deskripsi**: Keterangan (opsional)

3. Isi **Mapping Kolom Tabel**:

   Klik **"Tambah Kolom"** untuk menambah kolom baru. Setiap kolom memiliki 3 field:

   - **Label**: Header kolom yang akan ditampilkan (Contoh: "NOP", "Nama WP", "Jumlah")
   - **Path Data**: Lokasi data di response API (Contoh: "Wfirstdata.2", "Wtxamount")
   - **Type**: Tipe data untuk formatting
     - `String`: Text biasa
     - `Currency`: Format rupiah (Rp 1.000.000)
     - `Date`: Format tanggal (20 Desember 2024)
     - `Number`: Format angka (1,000)

4. **Status Aktif**: Toggle ON untuk mengaktifkan template
5. Klik **"Simpan"**

### Contoh Path Mapping:

**Response API**:
```json
{
  "Wfirstdata": ["val0", "val1", "NOP123", "val3"],
  "Wseconddata": ["a", "b", "c", "John Doe"],
  "Wtxamount": "500000",
  "Wtransdate": "20/12/24"
}
```

**Mapping Kolom**:

| Label | Path Data | Type |
|-------|-----------|------|
| NOP | Wfirstdata.2 | string |
| Nama WP | Wseconddata.3 | string |
| Jumlah Tagihan | Wtxamount | currency |
| Tanggal | Wtransdate | date |

**Hasil Tabel**:

| # | NOP | Nama WP | Jumlah Tagihan | Tanggal |
|---|-----|---------|----------------|---------|
| 1 | NOP123 | John Doe | Rp 500.000 | 20 Desember 2024 |

### Tips:
- Path menggunakan **dot notation** untuk akses array: `Wfirstdata.2` berarti ambil index ke-2
- Path tanpa dot untuk field langsung: `Wtxamount` langsung ambil nilai field
- Gunakan type `currency` untuk field jumlah uang
- Gunakan type `date` untuk field tanggal
- 1 template bisa digunakan oleh banyak proccode

---

## 3. Manage Proccodes

**Path**: `/admin/proccodes`

### Fungsi:
Kelola data proccode (jenis transaksi) dan hubungkan dengan template

### Cara Menambah Proccode Baru:

1. Klik tombol **"Tambah Proccode"**
2. Isi form:
   - **Code Proccode** *: Contoh: "180V99,180G99" (pisah dengan koma jika ada beberapa)
   - **Nama Proccode** *: Contoh: "PBB - Kabupaten Ende"
   - **Deskripsi**: Contoh: "Pajak Bumi dan Bangunan Kabupaten Ende"
   - **Source** *: Contoh: "psw4" (nama source API)
   - **Kategori** *: Contoh: "PBB", "BPHTB", dll
   - **Template Mapping**: Pilih template yang sesuai dari dropdown (opsional)
   - **Status Aktif**: Toggle ON agar muncul di dropdown rekonsiliasi
3. Klik **"Simpan"**

### Cara Memilih Template:

Saat memilih template, sistem akan menampilkan:
- Nama template
- Vendor
- Kategori

**Contoh**:
```
Template PBB Vendor A
Vendor A - Core System - PBB
```

Pilih template yang sesuai dengan **vendor** dan **kategori** proccode Anda.

### Cara Edit Proccode:

1. Klik icon **Pencil** di kolom Aksi
2. Update data atau ganti template
3. Klik **"Simpan"**

---

## Workflow Lengkap

### Skenario: Menambah Kabupaten Baru dengan Vendor Baru

**Contoh**: Tambah "PBB - Kabupaten Flores Timur" yang menggunakan Vendor B

#### Step 1: Cek Vendor
1. Buka **Admin > Vendors**
2. Cek apakah Vendor B sudah ada
3. Jika belum, klik **"Tambah Vendor"**:
   - Nama: "Vendor B - Alternative System"
   - Code: "vendor_b"
   - Status: Aktif

#### Step 2: Buat Template
1. Buka **Admin > Templates**
2. Klik **"Tambah Template"**
3. Isi:
   - Vendor: Vendor B
   - Kategori: PBB
   - Nama: "Template PBB Vendor B"
4. Mapping Kolom (sesuai format Vendor B):
   - Label: "NOP" | Path: "Wfirstdata.3" | Type: string
   - Label: "Nama WP" | Path: "Wseconddata.5" | Type: string
   - Label: "Lokasi" | Path: "Wseconddata.8" | Type: string
   - Label: "Total Bayar" | Path: "Wtxamount" | Type: currency
   - Label: "Waktu" | Path: "Wtransdate" | Type: date
5. Status: Aktif
6. Simpan

#### Step 3: Tambah Proccode
1. Buka **Admin > Proccodes**
2. Klik **"Tambah Proccode"**
3. Isi:
   - Code: "160V99,160G99"
   - Nama: "PBB - Kabupaten Flores Timur"
   - Deskripsi: "Pajak Bumi dan Bangunan Kabupaten Flores Timur"
   - Source: "psw4"
   - Kategori: "PBB"
   - Template: Pilih "Template PBB Vendor B"
   - Status: Aktif
4. Simpan

#### Step 4: Test di Rekonsiliasi
1. Buka **Rekonsiliasi Bank**
2. Pilih "PBB - Kabupaten Flores Timur" dari dropdown
3. Pilih tanggal
4. Klik **"Ambil Data"**
5. Tabel akan otomatis ter-render sesuai template Vendor B!

---

## Tips & Best Practices

### 1. Penamaan Template
Gunakan format: `Template [Kategori] [Vendor]`
- ✅ "Template PBB Vendor A"
- ✅ "Template BPHTB Vendor B"
- ❌ "Template 1"

### 2. Kategori Konsisten
Gunakan kategori yang sama untuk template dan proccode
- PBB
- BPHTB
- Pajak Daerah
- Retribusi Daerah
- Pajak Air Tanah

### 3. Testing Path Mapping
Sebelum membuat template:
1. Ambil sample response dari API
2. Analisis struktur JSON
3. Test path mapping di console browser
4. Baru buat template

### 4. Reuse Template
Jika ada beberapa kabupaten dengan vendor sama dan format sama:
- Buat 1 template saja
- Gunakan template yang sama untuk semua proccode

**Contoh**: 8 kabupaten pakai Vendor A → 1 template untuk 8 proccode

### 5. Backup Template
Sebelum edit template yang sudah dipakai banyak proccode:
- Buat template baru (copy mapping lama)
- Test dulu dengan 1 proccode
- Jika OK, baru update yang lama

---

## Troubleshooting

### Template tidak muncul saat pilih proccode?
- Pastikan template **Status Aktif = ON**
- Pastikan vendor template **Status Aktif = ON**

### Data tabel tidak sesuai format?
- Check **Path Data** di template mapping
- Pastikan path sesuai struktur response API
- Test dengan console.log response di browser

### Kolom tabel kosong / "-"?
- Path salah atau data tidak ada di response
- Check apakah index array benar (mulai dari 0)
- Pastikan field exist di response

### Error saat simpan template?
- **Mapping Kolom harus valid**: Minimal 1 kolom dengan Label dan Path terisi
- **JSON format error**: Jangan edit mapping manual, gunakan form UI

---

## Shortcut

| Menu | Path | Fungsi |
|------|------|--------|
| Vendors | `/admin/vendors` | CRUD vendors |
| Tambah Vendor | `/admin/vendors/create` | Form tambah vendor |
| Templates | `/admin/templates` | CRUD templates |
| Tambah Template | `/admin/templates/create` | Form tambah template |
| Proccodes | `/admin/proccodes` | CRUD proccodes |
| Tambah Proccode | `/admin/proccodes/create` | Form tambah proccode |

---

## Support

Jika ada pertanyaan atau masalah:
1. Check dokumentasi: `TEMPLATE_SYSTEM_GUIDE.md`
2. Check final setup: `FINAL_SETUP.md`
3. Check simulator examples: `SIMULATOR_EXAMPLES.md`
