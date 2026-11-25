# Monitoring Stock Sales–Operation (ZM68) di Netlify

Alur kerjanya:
- **Tim Logistik (admin)** membuka dashboard, klik **Perbarui data ZM68**, lalu pilih file Excel terbaru.
- **Divisi Sales** cukup membuka link yang sama dan otomatis melihat data serta olahan terbaru. Tidak ada tombol unggah, dan pengaturan dikunci.

Data disimpan di **Netlify Blobs** (penyimpanan milik situs Anda) lewat Netlify Function `/api/data`. File Excel tidak ditaruh sebagai file publik di situs.

## Isi folder

```
public/index.html              dashboard
netlify/functions/data.mjs     API data bersama (simpan & baca)
netlify.toml                   konfigurasi Netlify
package.json                   dependensi @netlify/blobs
```

## Setup sekali saja

> Netlify Functions **tidak berjalan lewat deploy drag & drop**. Pakai salah satu cara di bawah.

### Cara 1: lewat GitHub (disarankan)
1. Buat repository GitHub, upload seluruh isi folder ini (termasuk `netlify.toml`, `package.json`, folder `netlify` dan `public`).
2. Di Netlify: **Add new project → Import an existing project → GitHub**, pilih repository tersebut. Pengaturan build otomatis terbaca dari `netlify.toml`. Klik **Deploy**.

### Cara 2: lewat Netlify CLI
```
npm install -g netlify-cli
netlify login
cd monitoring-stok-zm68-netlify
netlify deploy --prod
```

### Atur kunci akses
Di Netlify: **Project configuration → Environment variables → Add a variable**:

| Variabel | Isi | Keterangan |
|---|---|---|
| `ADMIN_KEY` | kata sandi panjang, mis. `logistik-2026-xxxx` | Hanya untuk tim yang mengunggah data. **Wajib.** |
| `VIEW_KEY` | kode untuk Sales, mis. `sales-jambi` | Kode akses untuk melihat dashboard. Kosongkan jika dashboard boleh dibuka siapa pun yang tahu link-nya. |

Setelah menyimpan variabel, jalankan **Deploys → Trigger deploy → Deploy project** agar function memakai nilai baru.

## Pemakaian harian

**Admin (Logistik)**
1. Buka situs. Jika diminta kode akses, masukkan **ADMIN_KEY** (sekaligus mengaktifkan mode admin). Jika tidak diminta, buka **Pengaturan → Kunci admin → Masuk admin**.
2. Klik **Perbarui data ZM68**, lalu pilih file Excel hasil export ZM68.
3. Header menampilkan "Data bersama, diperbarui …". Selesai.

Pengaturan (batas Low/Over, target availability, tanggal data) yang diubah admin juga berlaku untuk semua viewer. Kunci admin cukup dimasukkan sekali per browser.

**Sales**
1. Buka link situs, masukkan **VIEW_KEY** sekali (jika diatur).
2. Dashboard menampilkan data terbaru. Halaman yang sedang terbuka memeriksa pembaruan setiap 3 menit, dan langsung saat tab dibuka kembali, jadi tidak perlu dimuat ulang.

## Keamanan

- Kode akses adalah sandi bersama sederhana. Untuk mencabut akses, ganti `VIEW_KEY` (atau `ADMIN_KEY`) lalu deploy ulang.
- Jangan simpan file ZM68 atau data stok di repository GitHub publik.
- Untuk proteksi lebih kuat (login per orang), gunakan fitur proteksi situs/SSO di paket Netlify berbayar, atau host di intranet.

## Alternatif tanpa function (drag & drop saja)

Simpan export ZM68 sebagai `public/data/zm68.xlsx`, lalu drag folder `public` ke **Deploys** setiap kali data berubah. Dashboard membaca file itu dan memeriksa pembaruan setiap 5 menit. Kekurangannya: file Excel **bisa diunduh siapa pun yang tahu alamatnya**, jadi pakai cara ini hanya bersama proteksi password situs Netlify.
