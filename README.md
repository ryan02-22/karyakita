# KaryaKita – Showcase Proyek Mahasiswa

KaryaKita adalah aplikasi web responsif untuk memamerkan portofolio proyek mahasiswa, lengkap dengan manajemen metadata, komentar/endorsement, filter pencarian, dan panel admin sederhana (mock UI). Proyek ini dibangun menggunakan React + Vite dengan styling kustom agar mudah dikembangkan lebih lanjut.

## Link Repository

- GitHub: [KaryaKita Web](https://github.com/your-org/karyakita-web) _(sesuaikan dengan URL repository Anda)_

## Fitur Utama (Prototype)

- Autentikasi nyata via Express + SQLite: registrasi akun kampus, login memakai email `@kampus.ac.id` **atau NIM**, serta sesi bertahan lintas restart server.
- Mode pengunjung tetap tersedia, namun aksi sensitif (tambah proyek) dibatasi untuk akun kampus.
- Dashboard menampilkan statistik ringkas, filter jurusan/tahun/kategori, serta grid proyek yang kini ditarik dari API backend (dengan fallback data mock).
- Notifikasi topbar memuat data dari backend saat pengguna kampus login.
- Form Tambah/Edit Proyek termasuk unggah gambar (mock), unggah dokumen, multi-select tag, live preview, sinkronisasi tahun dari tanggal, dan status pesan publikasi.
- Halaman Detail Proyek dengan gallery slider, metadata lengkap, komentar contoh, dan aksi endorse/share.
- Data mock pada `src/data/mockData.js` tetap tersedia sebagai fallback/seed untuk database.

## Struktur Proyek

- `src/pages` → Halaman utama (Login, Dashboard, Project Form, Project Detail).
- `src/data` → Data mock pengguna dan proyek.
- `src/index.css` → Desain sistem global (warna, layout, responsif).
- `src/App.jsx` → Routing dengan proteksi sederhana.

## Menjalankan

### Urutan Singkat

```bash
# dari root proyek
npm run setup        # sekali saja: install + migrasi + seed backend
npm run dev:all      # jalankan backend & frontend bersamaan
```

Aplikasi frontend tersedia di `http://localhost:5173` dan API backend di `http://localhost:4000`.

Jika salah satu proses ditutup, fitur seperti login atau mode pengunjung akan gagal (error `failed to fetch`). Pastikan kedua terminal tetap aktif selama pengembangan.

### 1. Frontend (Vite)

```bash
npm install
npm run dev
```

Frontend tersedia di `http://localhost:5173/`.

### 2. Backend (Express + SQLite)

```bash
cd server
npm install
npm run migrate   # membuat tabel SQLite
npm run seed      # menambahkan data awal (opsional, tapi disarankan)
npm run dev       # menjalankan server di http://localhost:4000
```

Jika ingin menjalankan backend di latar belakang saat pengembangan, gunakan:

```bash
npm run dev &
```

Variable lingkungan opsional:

| Key | Default | Keterangan |
| --- | --- | --- |
| `PORT` | `4000` | Port server Express |
| `SQLITE_PATH` | `server/data/app.db` | Lokasi file database |
| `ALLOWED_ORIGIN` | `http://localhost:5173` | Origin yang diizinkan untuk CORS |

Frontend membaca basis URL API dari `VITE_API_BASE_URL` (default `http://localhost:4000`). Sesuaikan di `.env` jika perlu:

```bash
VITE_API_BASE_URL=http://localhost:4000
```

### 3. Menjalankan Frontend + Backend Sekaligus

```bash
npm run dev:all    # backend + frontend aktif bersamaan
```

## Build Produksi

```bash
npm run build
npm run preview
```

## Catatan Pengujian Manual

- `npm run build` memastikan bundling tanpa error.
- Jalankan backend (`npm run dev` di folder `server`) sebelum menguji login/registrasi.
- Uji alur: registrasi akun baru, login memakai email & NIM, mode pengunjung, logout.
- Verifikasi Dashboard memuat proyek/notification dari backend dan badge notifikasi berubah saat dibuka.
- Validasi form tambah proyek: unggah gambar/dokumen (mock), multi-select tag, auto-sync tanggal → tahun, tombol Draft/Publikasikan.
- Responsif: cek tampilan mobile (≤768px) dan desktop.

## Langkah Selanjutnya (Opsional)

- Migrasi backend ke arsitektur terstruktur (mis. REST modular atau GraphQL) serta dukungan refresh token/JWT.
- Ganti SQLite lokal dengan database terkelola (PostgreSQL/MySQL) + storage objek (S3/MinIO) untuk unggahan riil.
- Implementasi unggah file riil & notifikasi waktu nyata (WebSocket/FCM).
- Automasi pengujian (unit dengan Vitest/Jest, e2e dengan Playwright).
- Integrasi SSO kampus, rate limiting, audit trail, dan logging terpusat.
