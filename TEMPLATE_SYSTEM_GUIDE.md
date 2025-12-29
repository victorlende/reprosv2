# Template System - Panduan Lengkap

## Konsep Sistem

Sistem ini memungkinkan mapping data yang berbeda untuk setiap vendor/kabupaten tanpa perlu edit code.

### Struktur:
```
Vendor → Template → Proccode
```

- **Vendor**: Vendor A, B, C (penyedia sistem)
- **Template**: Definisi kolom tabel untuk kategori tertentu (PBB, BPHTB, dll)
- **Proccode**: Data kabupaten yang menggunakan template tertentu

---

## Database Schema

### 1. Table `vendors`
| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| name | string | Nama vendor (Vendor A) |
| code | string | Code vendor (vendor_a) |
| description | text | Deskripsi |
| is_active | boolean | Status aktif |

### 2. Table `templates`
| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| vendor_id | bigint | FK ke vendors |
| category | string | PBB, BPHTB, Pajak Daerah, dll |
| name | string | Nama template |
| mapping | json | **Mapping kolom tabel** |
| description | text | Deskripsi |
| is_active | boolean | Status aktif |

### 3. Table `proccodes` (Updated)
| Column | Type | Description |
|--------|------|-------------|
| template_id | bigint (new) | FK ke templates |
| ... | ... | Field lain tetap sama |

---

## Format Mapping JSON

```json
{
  "table_columns": [
    {
      "label": "NOP",
      "path": "Wfirstdata.2",
      "type": "string"
    },
    {
      "label": "Nama WP",
      "path": "Wseconddata.10",
      "type": "string"
    },
    {
      "label": "Jumlah",
      "path": "Wtxamount",
      "type": "currency"
    },
    {
      "label": "Tanggal",
      "path": "Wtransdate",
      "type": "date"
    }
  ]
}
```

### Field Explanation:
- **label**: Header kolom di tabel
- **path**: Path ke data di response JSON (support nested: `Wfirstdata.2`, `Wseconddata[10]`)
- **type**: Tipe data untuk formatting
  - `string`: Text biasa
  - `currency`: Format rupiah (Rp 1.000.000)
  - `date`: Format tanggal (dd/mm/yyyy)
  - `number`: Format number (1,000)

---

## Setup Database

### Quick Setup (Recommended):
```bash
setup-template-system.bat
```

### Manual Setup:
```bash
# 1. Run migrations
php artisan migrate

# 2. Seed vendors
php artisan db:seed --class=VendorSeeder

# 3. Seed templates
php artisan db:seed --class=TemplateSeeder

# 4. Seed proccodes
php artisan db:seed --class=ProccodeSeeder

# 5. Clear cache
php artisan config:clear
```

---

## Data yang Di-seed

### Vendors (3):
1. **Vendor A - Core System** (`vendor_a`)
2. **Vendor B - Alternative System** (`vendor_b`)
3. **Vendor C - Legacy System** (`vendor_c`)

### Templates (4):
1. **Template PBB Vendor A**
   - NOP, Nama WP, Alamat, Tahun Pajak, Jumlah, Tanggal

2. **Template PBB Vendor B**
   - NOP, Nama WP, Lokasi, Periode, Total Bayar, Waktu

3. **Template BPHTB Vendor A**
   - No. SSB, Nama Pembeli, Nama Penjual, Lokasi, NPOP, BPHTB, Tanggal

4. **Template Pajak Air Vendor A**
   - No. Rekening, Nama WP, Alamat, Periode, Jumlah, Tanggal

### Proccodes (5):
- 2 Pajak Air (Manggarai, Kupang) → Template Pajak Air A
- 2 PBB Vendor A (Ende, Kupang)
- 1 PBB Vendor B (Flores Timur)

---

## Frontend Implementation

Frontend akan otomatis:
1. Load template dari proccode yang dipilih
2. Render kolom tabel dinamis berdasarkan `mapping.table_columns`
3. Extract data dari response API menggunakan `path`
4. Format data sesuai `type`

**File**: `resources/js/Pages/rekonsiliasi/index.tsx`

---

## Menambah Template Baru

### Via Database:
```sql
INSERT INTO templates (vendor_id, category, name, mapping, is_active, created_at, updated_at)
VALUES (
    1, -- vendor_id (Vendor A)
    'Retribusi Daerah',
    'Template Retribusi Vendor A',
    '{"table_columns":[{"label":"No. SKRD","path":"Wfirstdata.1","type":"string"},{"label":"Nama WP","path":"Wseconddata.5","type":"string"},{"label":"Jumlah","path":"Wtxamount","type":"currency"}]}',
    true,
    NOW(),
    NOW()
);
```

### Via Seeder:
Edit `TemplateSeeder.php`, tambah array template baru, lalu:
```bash
php artisan db:seed --class=TemplateSeeder
```

---

## Menambah Proccode Baru

```sql
INSERT INTO proccodes (code, name, description, source, category, template_id, is_active)
VALUES (
    '180V99,180G99',
    'PBB - Kabupaten Baru',
    'Pajak Bumi dan Bangunan Kabupaten Baru',
    'psw4',
    'PBB',
    2, -- template_id (Template PBB Vendor B)
    true
);
```

---

## Contoh Path Mapping

### Response API:
```json
{
  "Wfirstdata": ["val0", "val1", "NOP123", "val3"],
  "Wseconddata": ["a", "b", "c", "John Doe"],
  "Wtxamount": "500000",
  "Wtransdate": "20/12/24"
}
```

### Mapping:
```json
{
  "table_columns": [
    {"label": "NOP", "path": "Wfirstdata.2"},      // → "NOP123"
    {"label": "Nama", "path": "Wseconddata.3"},     // → "John Doe"
    {"label": "Jumlah", "path": "Wtxamount"},       // → "500000"
    {"label": "Tanggal", "path": "Wtransdate"}      // → "20/12/24"
  ]
}
```

---

## Keuntungan Sistem Ini

✅ **Fleksibel**: Beda vendor = beda template, tanpa edit code
✅ **Scalable**: Tambah kabupaten/vendor baru cukup via database
✅ **Maintainable**: Update template di 1 tempat, semua proccode ikut update
✅ **Reusable**: 1 template bisa dipakai banyak proccode
✅ **Override**: Proccode bisa punya custom mapping jika perlu

---

## Next Steps

1. **Buat CRUD Menu Admin** untuk:
   - Manage vendors
   - Manage templates
   - Manage proccodes

2. **Frontend Dynamic Table** (Next Task):
   - Parse template mapping
   - Render tabel dinamis
   - Format data sesuai type

3. **Export Feature**:
   - Export ke Excel dengan kolom sesuai template

---

## Troubleshooting

### Template tidak muncul di proccode
- Pastikan `template_id` terisi
- Check: `SELECT * FROM proccodes WHERE template_id IS NULL`

### Data tabel tidak muncul
- Check path mapping di template
- Pastikan path sesuai dengan struktur response API
- Test dengan console.log response data

### Seeder error "Templates not found"
- Run seeder dengan urutan:
  1. VendorSeeder
  2. TemplateSeeder
  3. ProccodeSeeder

---

## API Response dari isijson.txt

Berdasarkan file `isijson.txt`, structure response API:
```json
{
  "proccode": "...",
  "transdate": "...",
  "status": "SUKSES",
  "source": "...",
  "xdatatemp": [
    {
      "Wfirstdata": [...],
      "Wseconddata": [...],
      "Wtxamount": "...",
      "Wtransdate": "...",
      ...
    }
  ]
}
```

Data transaksi ada di `xdatatemp[0]`, jadi frontend perlu:
```javascript
const transactionData = response.xdatatemp[0];
```

Lalu extract berdasarkan template mapping.
