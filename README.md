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

### Menjalankan Frontend (Vite)

```bash
npm install
npm run dev
```

Frontend tersedia di `http://localhost:5173/`.

## Build Produksi

```bash
npm run build
npm run preview
```

> **Catatan:** Seluruh data (akun, proyek baru, setelan) kini tersimpan di `localStorage` per
> perangkat/peramban. Jika ingin memulai ulang, cukup hapus data penyimpanan lokal browser.

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
