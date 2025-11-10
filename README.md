# KaryaKita – Showcase Proyek Mahasiswa

KaryaKita adalah aplikasi web responsif untuk memamerkan portofolio proyek mahasiswa, lengkap dengan manajemen metadata, komentar/endorsement, filter pencarian, dan panel admin sederhana (mock UI). Proyek ini dibangun menggunakan React + Vite dengan styling kustom agar mudah dikembangkan lebih lanjut.

## Link Repository

- GitHub: [KaryaKita Web](https://github.com/your-org/karyakita-web) _(sesuaikan dengan URL repository Anda)_

## Fitur Utama (Prototype)

- Login menggunakan email kampus `@kampus.ac.id` **atau NIM**, dengan mode pengunjung untuk akses cepat tanpa registrasi.
- Mode Dosen: dosen dapat melihat antrean proyek, memberi catatan, memverifikasi, menolak, atau menerbitkan karya mahasiswa. Proyek hanya tampil publik setelah disetujui.
- Semua data akun, proyek, dan notifikasi disimpan aman di `localStorage` masing-masing perangkat (hash kata sandi menggunakan `bcryptjs`).
- Dashboard menampilkan statistik ringkas, filter jurusan/tahun/kategori, daftar proyek yang otomatis segar saat dipublikasikan, serta kartu khusus “Menunggu Review” bagi dosen.
- Form Tambah/Edit Proyek mendukung unggah gambar mock, lampiran dokumen (PDF/ZIP), multi-select tag, live preview, dan integrasi tanggal → tahun secara otomatis.
- Halaman Detail Proyek berisi slider preview, metadata lengkap, tautan demo/dokumen, proyek terkait, serta aksi endorse/share dengan pembatasan untuk pengunjung. Dosen mendapat panel tindakan untuk menyetujui/menolak, sedangkan mahasiswa melihat status review dan catatan dosen.

## Struktur Proyek

- `src/pages` → Halaman utama (Login, Dashboard, Project Form, Project Detail).
- `src/data` → Data mock pengguna dan proyek.
- `src/index.css` → Desain sistem global (warna, layout, responsif).
- `src/App.jsx` → Routing dengan proteksi sederhana.

## Cara Menjalankan dan Menggunakan

1. Pastikan Node.js terpasang.
2. Jalankan perintah berikut di folder proyek:

```bash
npm install
npm run dev
```

3. Buka `http://localhost:5173/`.
4. Pilih tab **Daftar** untuk membuat akun baru (email kampus atau NIM). Jika hanya ingin menelusuri, klik **Masuk sebagai Pengunjung**.
5. Setelah login dengan akun kampus:
   - Mahasiswa: gunakan tombol **+ Tambah Proyek**, unggah berkas, lalu **Publikasikan** → status berubah menjadi *Menunggu Review*. Hanya dosen & pemilik yang dapat melihat sebelum disetujui.
   - Dosen: buka kartu **Menunggu Review** untuk meninjau, beri catatan, lalu **Setujui & Publikasikan** atau **Tolak & Beri Catatan**.
   - Proyek yang disetujui langsung tersedia bagi seluruh pengguna (termasuk pengunjung). Catatan dosen tersimpan agar mahasiswa dapat revisi dan mengirim ulang.

## Build Produksi

```bash
npm run build
npm run preview
```

> **Catatan:** Seluruh data (akun, proyek baru, setelan) kini tersimpan di `localStorage` per
> perangkat/peramban. Jika ingin memulai ulang, cukup hapus data penyimpanan lokal browser.

## Catatan Pengujian Manual

- `npm run build` memastikan bundling produksi berjalan tanpa error.
- Uji alur utama: registrasi akun (Mahasiswa & Dosen), login memakai email/NIM, mode pengunjung, logout.
- Tambahkan proyek baru sebagai mahasiswa. Verifikasi bahwa status menjadi *Menunggu Review* dan hanya terlihat oleh dosen/pemilik.
- Login sebagai dosen, tinjau proyek pending, coba *Setujui & Publikasikan* dan *Tolak & Beri Catatan*, lalu pastikan catatan muncul di halaman detail mahasiswa.
- Uji responsivitas di perangkat mobile (≤768px) dan desktop.

## Langkah Selanjutnya (Opsional)

- Integrasi backend tersendiri bila ingin sinkronisasi lintas perangkat.
- Implementasi unggah file riil & notifikasi waktu nyata.
- Automasi pengujian (unit dengan Vitest/Jest, e2e dengan Playwright).
- Integrasi SSO kampus, rate limiting, audit trail, dan logging terpusat.
