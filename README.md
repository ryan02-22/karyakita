# KaryaKita – Showcase Proyek Mahasiswa

Aplikasi web responsif untuk memamerkan portofolio proyek mahasiswa dengan sistem review dosen, lengkap dengan manajemen metadata, komentar/endorsement, filter pencarian, dan panel admin sederhana.

## 📋 Daftar Isi

- [🚀 Quick Start - Cara Menjalankan Aplikasi](#-quick-start---cara-menjalankan-aplikasi)
- [Fitur Utama](#fitur-utama)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Struktur Proyek](#struktur-proyek)
- [Instalasi dan Setup](#instalasi-dan-setup)
- [📖 Panduan Penggunaan Aplikasi](#-panduan-penggunaan-aplikasi)
- [⚠️ REMINDER: Siapa yang Harus Daftar?](#️-reminder-siapa-yang-harus-daftar)
- [Database](#database)
- [Perbedaan User Mahasiswa dan Dosen](#perbedaan-user-mahasiswa-dan-dosen)
- [API Endpoints (Server)](#api-endpoints-server)
- [Build Produksi](#build-produksi)
- [Pengujian](#pengujian)
- [Troubleshooting](#troubleshooting)
- [Kontribusi](#kontribusi)

## 🚀 Quick Start - Cara Menjalankan Aplikasi

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### 📝 Penjelasan Singkat: Apa yang Perlu Dilakukan?

**TL;DR (Too Long; Didn't Read):**
- ✅ **Langkah 1 & 2** → Hanya perlu dilakukan **sekali** saat pertama kali setup
- ✅ **Langkah 3** → Hanya perlu dilakukan jika ingin **build untuk production**
- ✅ **Langkah 4** → **WAJIB dilakukan setiap kali** mau menjalankan aplikasi

**Penjelasan Detail:**

#### 🔧 Setup Awal (Hanya Sekali)

Langkah-langkah di bawah ini **hanya perlu dilakukan sekali** saat pertama kali clone/download project atau setelah update dependencies:

1. **Install Dependencies** → Download semua library yang dibutuhkan
2. **Setup Database** → Buat struktur database dan isi data awal

Setelah setup awal selesai, Anda **tidak perlu** mengulang langkah 1 & 2 lagi setiap kali mau running aplikasi.

#### 🏃 Menjalankan Aplikasi (Setiap Kali)

Langkah ini **WAJIB dilakukan setiap kali** Anda mau menjalankan aplikasi untuk development atau testing.

---

### Langkah-Langkah Menjalankan Aplikasi

#### 1. Install Dependencies (Hanya Sekali - Skip jika Sudah Pernah Install)

**Install dependencies frontend:**
```bash
npm install
```

**Install dependencies backend:**
```bash
cd server
npm install
cd ..
```

**💡 Kapan perlu install ulang?**
- Saat pertama kali clone project
- Setelah pull update yang mengubah `package.json`
- Jika ada error "module not found"

#### 2. Setup Database (Hanya Sekali - Skip jika Database Sudah Ada)

**Migrasi database dan seed data awal:**
```bash
cd server
npm run migrate  # Membuat struktur tabel database
npm run seed     # Mengisi data awal (akun default)
cd ..
```

**💡 Kapan perlu setup ulang database?**
- Saat pertama kali setup project
- Jika ingin reset semua data ke kondisi awal (gunakan `npm run reset-db`)

#### 3. Build Aplikasi (Hanya untuk Production - Skip untuk Development)

**Apa itu Build? 🤔**

**Build BUKAN memperbarui source code**, tapi mengkonversi source code menjadi file yang siap untuk production.

**Analogi sederhana:**
- **Source code** = Resep masakan (file `.jsx`, `.js` yang bisa dibaca manusia)
- **Build** = Masakan jadi yang siap disajikan (file yang sudah dioptimasi, dikompres, dan siap dijalankan)

**Apa yang dilakukan saat build?**
1. ✅ Menggabungkan semua file menjadi beberapa file besar
2. ✅ Mengoptimasi kode (menghapus spasi, komentar yang tidak perlu)
3. ✅ Mengkompres file agar lebih kecil dan cepat dimuat
4. ✅ Mengkonversi kode modern menjadi kode yang kompatibel dengan browser lama
5. ✅ Menghasilkan file di folder `dist/` yang siap di-deploy ke server

**Build frontend untuk production:**
```bash
npm run build
```
Output build akan berada di folder `dist/`

**💡 Kapan perlu build?**
- ✅ Hanya jika ingin **deploy ke production** (hosting, server, dll)
- ❌ Untuk development, **TIDAK PERLU** build, langsung ke langkah 4
- ❌ Build **TIDAK mengubah** source code Anda, hanya membuat versi production

**Perbedaan Development vs Production:**

| Aspek | Development (`npm run dev`) | Production (`npm run build`) |
|-------|----------------------------|------------------------------|
| **Kecepatan** | Cepat start, lambat saat akses | Lambat build, cepat saat akses |
| **File Size** | Besar (belum dikompres) | Kecil (sudah dikompres) |
| **Error Info** | Detail (untuk debugging) | Minimal (untuk performa) |
| **Hot Reload** | ✅ Ada (auto refresh) | ❌ Tidak ada |
| **Kapan Pakai** | Saat coding/development | Saat deploy ke server |

#### 4. Menjalankan Aplikasi (WAJIB Setiap Kali)

**Opsi A: Development Mode (Recommended untuk Development)**

Buka **2 terminal terpisah**:

**Terminal 1 - Frontend Dev Server:**
```bash
npm run dev
```
Frontend akan berjalan di `http://localhost:5173`

**Terminal 2 - Backend Server:**
```bash
cd server
npm run dev
```
Server akan berjalan di `http://localhost:4000` (atau sesuai konfigurasi di `server/src/config/env.js`)

**💡 Catatan Penting:**
- **WAJIB menjalankan kedua terminal** (frontend + backend)
- Jika hanya menjalankan frontend, fitur yang butuh backend tidak akan berfungsi
- Untuk stop aplikasi, tekan `Ctrl+C` di kedua terminal

**Opsi B: Production Mode (Hanya untuk Testing Production Build)**

**Terminal 1 - Frontend Preview:**
```bash
npm run preview
```
Frontend akan berjalan di `http://localhost:4173`

**Terminal 2 - Backend Server:**
```bash
cd server
npm start
```
Server akan berjalan di `http://localhost:4000`

#### 5. Akses Aplikasi

1. Buka browser dan akses: `http://localhost:5173` (development) atau `http://localhost:4173` (production)
2. Login dengan akun default:
   - Email: `alya@kampus.ac.id` atau NIM: `231234567` (Mahasiswa)
   - Email: `dosen@kampus.ac.id` atau NIM: `1987654321` (Dosen)
   - Email: `admin@kampus.ac.id` atau NIM: `000000000` (Admin)
   - Password: `KaryaKita!2025`
3. Atau klik **"Masuk sebagai Pengunjung"** untuk melihat tanpa login

### ⚡ Quick Commands Summary

#### 🎯 Untuk Development (Yang Paling Sering Digunakan)

**Setup Awal (Hanya Sekali):**
```bash
# Install semua dependencies
npm install && cd server && npm install && cd ..

# Setup database
cd server && npm run migrate && npm run seed && cd ..
```

**Menjalankan Aplikasi (Setiap Kali):**
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend (buka terminal baru)
cd server && npm run dev
```

#### 🚀 Untuk Production

```bash
# Build frontend
npm run build

# Menjalankan production (2 terminal)
# Terminal 1:
npm run preview
# Terminal 2:
cd server && npm start
```

### 📌 Checklist Cepat

**Pertama Kali Setup:**
- [ ] Install dependencies frontend (`npm install`)
- [ ] Install dependencies backend (`cd server && npm install`)
- [ ] Setup database (`cd server && npm run migrate && npm run seed`)

**Setiap Kali Running:**
- [ ] Jalankan frontend (`npm run dev`)
- [ ] Jalankan backend (`cd server && npm run dev`)
- [ ] Buka browser ke `http://localhost:5173`

### 🔧 Troubleshooting Cepat

**Jika port sudah digunakan:**
- Frontend: Ubah port di `vite.config.js`
- Backend: Ubah `APP_PORT` di `server/src/config/env.js`

**Jika database error:**
```bash
cd server
npm run reset-db  # Reset database
npm run migrate   # Migrasi ulang
npm run seed      # Seed ulang
```

**Jika ada masalah dengan localStorage:**
- Buka DevTools (F12) → Application → Local Storage → Hapus semua data
- Refresh halaman

---

## ✨ Fitur Utama

### Autentikasi & Keamanan
- ✅ Login menggunakan email kampus `@kampus.ac.id` **atau NIM**
- ✅ Mode pengunjung untuk akses cepat tanpa registrasi
- ✅ Password di-hash menggunakan `bcryptjs` (salt rounds: 10)
- ✅ Session management dengan TTL 120 menit
- ✅ Verifikasi email dengan kode OTP (6 digit)
- ✅ Reset password dengan verifikasi email

### Dashboard
- 📊 Statistik ringkas (Total Proyek, Endorsements, Proyek Populer)
- 🔍 Pencarian real-time (judul, deskripsi, nama mahasiswa, tags)
- 🎯 Filter multi-kriteria (Jurusan, Tahun, Kategori)
- 📋 Daftar proyek dengan status review
- 🔔 Notifikasi real-time
- 👤 Profile card dengan avatar dan badge verifikasi

### Manajemen Proyek
- ➕ Tambah proyek baru dengan form lengkap
- ✏️ Edit proyek yang sudah dibuat
- 🗑️ Hapus proyek (hanya owner)
- 📝 Draft auto-save ke localStorage
- 🖼️ Upload gambar (maks. 5 file, 20MB per file)
- 📄 Upload dokumen (PDF/ZIP, maks. 20MB)
- 🏷️ Multi-select tags
- 👁️ Live preview saat mengetik
- 📅 Auto-generate tahun dari tanggal

### Review System (Dosen)
- 👨‍🏫 Panel khusus "Menunggu Review" di dashboard
- ✅ Approve & Publish proyek
- ❌ Reject dengan catatan revisi
- 📝 Tambah catatan review
- 🔄 Kembalikan proyek yang sudah dipublikasikan untuk revisi

### Interaksi Sosial
- ❤️ Endorsement proyek (like/unlike)
- 💬 Komentar pada proyek
- 🔗 Share proyek (Web Share API atau copy link)
- 📊 Statistik engagement (endorsements, komentar)

## 🛠️ Teknologi yang Digunakan

### Frontend
- **React 19.1.1** - Library UI
- **React Router DOM 7.9.5** - Routing
- **Vite 7.1.7** - Build tool & dev server
- **React Icons 5.5.0** - Icon library
- **bcryptjs 3.0.3** - Password hashing

### Backend (Server)
- **Node.js** - Runtime environment
- **Express 5.1.0** - Web framework
- **better-sqlite3 12.4.1** - SQLite database driver
- **bcryptjs 3.0.3** - Password hashing
- **CORS 2.8.5** - Cross-origin resource sharing
- **nanoid 5.1.6** - ID generator

### Database
- **SQLite** - File-based database
  - Lokasi: `server/data/app.db`
  - WAL mode enabled untuk performa lebih baik
  - Foreign keys enabled

### Development Tools
- **ESLint 9.36.0** - Code linting
- **Nodemon 3.1.10** - Auto-restart server saat development

## 📁 Struktur Proyek

```
karyakita-web/
├── src/                          # Source code frontend
│   ├── components/              # Komponen reusable
│   │   └── ErrorBoundary.jsx   # Error boundary untuk catch error
│   ├── pages/                   # Halaman aplikasi
│   │   ├── LoginPage.jsx       # Halaman login/register
│   │   ├── DashboardPage.jsx   # Dashboard utama
│   │   ├── ProjectFormPage.jsx # Form tambah/edit proyek
│   │   └── ProjectDetailPage.jsx # Detail proyek
│   ├── utils/                   # Utility functions
│   │   ├── security.js         # Fungsi keamanan & autentikasi
│   │   └── storage.js          # Fungsi localStorage
│   ├── data/                    # Data mock/default
│   │   └── mockData.js         # Data awal (users, projects, dll)
│   ├── App.jsx                  # Komponen utama & routing
│   ├── main.jsx                 # Entry point aplikasi
│   └── index.css                # Global styles
│
├── server/                       # Backend server
│   ├── src/
│   │   ├── config/              # Konfigurasi
│   │   │   └── env.js          # Environment variables
│   │   ├── db.js                # Database connection
│   │   ├── index.js             # Server entry point
│   │   ├── middleware/          # Express middleware
│   │   │   └── authMiddleware.js # Authentication middleware
│   │   ├── routes/              # API routes
│   │   │   ├── auth.js         # Auth endpoints
│   │   │   ├── projects.js     # Project endpoints
│   │   │   └── notifications.js # Notification endpoints
│   │   ├── repositories/        # Data access layer
│   │   │   ├── userRepository.js
│   │   │   ├── projectRepository.js
│   │   │   ├── sessionRepository.js
│   │   │   └── notificationRepository.js
│   │   ├── services/            # Business logic
│   │   │   └── authService.js
│   │   ├── utils/               # Utility functions
│   │   │   ├── validators.js   # Validasi input
│   │   │   └── http.js         # HTTP helpers
│   │   └── scripts/             # Database scripts
│   │       ├── migrate.js      # Migration script
│   │       ├── seed.js         # Seed data script
│   │       └── reset-db.js     # Reset database script
│   ├── data/                    # Database files
│   │   └── app.db              # SQLite database
│   └── package.json
│
├── laravel/                      # Laravel backend (opsional)
│   ├── app/                     # Application code
│   ├── database/                # Database migrations & seeders
│   └── routes/                  # Laravel routes
│
├── public/                       # Static assets
├── dist/                         # Build output (production)
├── index.html                    # HTML entry point
├── vite.config.js                # Vite configuration
├── package.json                  # Frontend dependencies
└── README.md                     # Dokumentasi ini
```

## 🚀 Instalasi dan Setup

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 (atau yarn/pnpm)

### Langkah Instalasi

1. **Clone repository**
```bash
git clone https://github.com/your-org/karyakita-web.git
cd karyakita-web
```

2. **Install dependencies frontend**
```bash
npm install
```

3. **Install dependencies server**
```bash
cd server
npm install
cd ..
```

4. **Setup database**
```bash
cd server
npm run migrate  # Membuat struktur tabel
npm run seed     # Mengisi data awal
cd ..
```

## 🎮 Cara Menjalankan

### Development Mode

**Terminal 1 - Frontend:**
```bash
npm run dev
```
Frontend akan berjalan di `http://localhost:5173`

**Terminal 2 - Backend Server (Opsional):**
```bash
cd server
npm run dev
```
Server akan berjalan di `http://localhost:4000`

### Production Mode

**Build frontend:**
```bash
npm run build
```

**Preview build:**
```bash
npm run preview
```

**Jalankan server production:**
```bash
cd server
npm start
```

## 📖 Panduan Penggunaan Aplikasi

### 🚀 Quick Start (Mulai Cepat)

1. **Jalankan aplikasi** (lihat [Cara Menjalankan](#cara-menjalankan))
2. **Buka browser** → `http://localhost:5173`
3. **Pilih cara masuk:**
   - **Pengunjung**: Klik "Masuk sebagai Pengunjung" (tanpa registrasi)
   - **Login**: Gunakan akun default atau daftar akun baru

---

### 👤 Untuk Pengunjung (Guest)

#### Fitur yang Tersedia:
- ✅ Melihat semua proyek yang sudah dipublikasikan
- ✅ Mencari proyek dengan keyword
- ✅ Filter proyek berdasarkan Jurusan, Tahun, Kategori
- ✅ Melihat detail proyek lengkap
- ✅ Melihat komentar dan statistik proyek

#### Fitur yang Tidak Tersedia:
- ❌ Membuat proyek baru
- ❌ Memberikan komentar
- ❌ Memberikan endorsement
- ❌ Melihat statistik pribadi

#### Cara Menggunakan:
1. Klik **"Masuk sebagai Pengunjung"** di halaman login
2. Dashboard akan menampilkan semua proyek publik
3. Gunakan **search bar** untuk mencari proyek
4. Gunakan **filter sidebar** untuk memfilter proyek
5. Klik **"Lihat"** pada kartu proyek untuk melihat detail

---

### 🎓 Untuk Mahasiswa

#### 1. Membuat Proyek Baru

**Langkah-langkah:**
1. Login dengan akun mahasiswa
2. Di dashboard, klik tombol **"+ Tambah Proyek"** (di sidebar atau topbar)
3. Isi form proyek:
   - **Judul Proyek** (wajib)
   - **Deskripsi** (wajib) - ringkasan proyek
   - **Tag/Kategori** - pilih dari dropdown (bisa multiple)
   - **Bidang Proyek** - pilih atau ketik kategori baru
   - **Jurusan** - pilih jurusan
   - **Status Proyek** - Perencanaan/Sedang Berjalan/Selesai
   - **Tanggal Pembuatan** - otomatis generate tahun
   - **Upload Gambar** (maks. 5 file, 20MB per file)
   - **Upload Dokumen** (PDF/ZIP, maks. 20MB)
   - **Link Demo/Repository** (opsional)
4. Klik **"Simpan sebagai Draft"** untuk menyimpan sementara
   - Atau klik **"Publikasikan"** untuk langsung kirim ke dosen
5. Setelah dipublikasikan, status akan menjadi **"Menunggu Review"**
6. Proyek akan terlihat oleh dosen dan pemilik saja

#### 2. Melihat Status Proyek

**Status yang Mungkin:**
- 🟡 **Menunggu Review** - Proyek sedang ditinjau dosen
- 🟢 **Dipublikasikan** - Proyek sudah disetujui dan terlihat publik
- 🔴 **Perlu Revisi** - Proyek ditolak, perlu perbaikan

**Cara Melihat:**
- Dashboard akan menampilkan banner jika ada proyek yang pending/rejected
- Klik proyek untuk melihat detail dan catatan dosen (jika ada)

#### 3. Edit Proyek

**Langkah-langkah:**
1. Buka detail proyek yang ingin diedit
2. Klik tombol **"Edit Proyek"** di sidebar
3. Ubah data yang diperlukan
4. Klik **"Publikasikan"** untuk menyimpan perubahan

#### 4. Revisi Proyek yang Ditolak

**Langkah-langkah:**
1. Buka detail proyek yang statusnya "Perlu Revisi"
2. Baca **catatan dosen** di halaman detail
3. Klik **"Edit Proyek"** untuk memperbaiki
4. Setelah selesai, klik **"Kirim Ulang untuk Review"**
5. Status kembali menjadi "Menunggu Review"

#### 5. Memberikan Komentar

**Langkah-langkah:**
1. Buka detail proyek yang sudah dipublikasikan
2. Scroll ke bagian **"Komentar"**
3. Ketik komentar di textarea
4. Tekan **Ctrl+Enter** (atau Cmd+Enter di Mac) atau klik **"Kirim Komentar"**

#### 6. Memberikan Endorsement

**Langkah-langkah:**
1. Buka detail proyek yang sudah dipublikasikan
2. Klik tombol **"Endorse"** (ikon hati)
3. Endorsement akan ditambahkan ke proyek
4. Klik lagi untuk membatalkan endorsement

---

### 👨‍🏫 Untuk Dosen

#### 1. Review Proyek Mahasiswa

**Langkah-langkah:**
1. Login dengan akun dosen
2. Di dashboard, lihat kartu **"Menunggu Review Dosen"**
   - Atau lihat banner yang menampilkan jumlah proyek pending
3. Klik **"Tinjau"** pada proyek yang ingin direview
4. Baca detail proyek, deskripsi, dan lampiran
5. Pilih salah satu aksi:

   **A. Setujui & Publikasikan:**
   - Klik **"Setujui & Publikasikan"**
   - (Opsional) Masukkan catatan untuk mahasiswa
   - Klik OK
   - ✅ Proyek langsung terlihat publik

   **B. Tolak & Beri Catatan:**
   - Klik **"Tolak & Beri Catatan"**
   - **WAJIB** masukkan catatan revisi
   - Klik OK
   - ❌ Proyek dikembalikan ke mahasiswa dengan status "Perlu Revisi"

#### 2. Mengembalikan Proyek yang Sudah Dipublikasikan

**Langkah-langkah:**
1. Buka detail proyek yang sudah dipublikasikan
2. Klik **"Kembalikan untuk Revisi"**
3. Masukkan catatan revisi
4. Proyek akan kembali ke status "Perlu Revisi"

#### 3. Membuat Proyek sebagai Dosen

**Langkah-langkah:**
1. Klik **"+ Tambah Proyek"**
2. Isi form seperti biasa
3. Klik **"Publikasikan"**
4. ✅ Proyek langsung terlihat publik (tidak perlu review)

---

### 🔍 Fitur Pencarian dan Filter

#### Pencarian (Search)
- Ketik keyword di **search bar** di topbar
- Mencari di: Judul, Deskripsi, Nama Mahasiswa, Tags
- Pencarian bersifat **real-time** (langsung filter saat mengetik)

#### Filter
Gunakan sidebar di dashboard untuk filter:
- **Jurusan** - Filter berdasarkan jurusan
- **Tahun** - Filter berdasarkan tahun proyek
- **Kategori** - Filter berdasarkan kategori/bidang proyek

**Reset Filter:**
- Klik tombol **"Reset"** di bagian atas sidebar

---

### 🔔 Notifikasi

#### Melihat Notifikasi
1. Klik ikon **bell** di topbar
2. Dropdown akan menampilkan semua notifikasi
3. Notifikasi yang belum dibaca akan ditandai dengan badge angka

#### Membaca Notifikasi
- Klik pada notifikasi untuk menandai sebagai sudah dibaca
- Dropdown akan otomatis tertutup setelah klik

**Jenis Notifikasi:**
- Komentar baru pada proyek Anda
- Endorsement diterima
- Verifikasi akun
- Review proyek (untuk mahasiswa)

---

### 👤 Profil dan Statistik

#### Melihat Statistik
Di dashboard, bagian **Stats Strip** menampilkan:
- **Total Proyek** - Jumlah proyek yang dibuat
- **Endorsements** - Total endorsement yang diterima
- **Proyek Populer** - Proyek dengan endorsement terbanyak

#### Profile Card
Di topbar, bagian avatar menampilkan:
- Nama user
- Badge verifikasi (✔) jika terverifikasi
- Role (Mahasiswa/Dosen/Pengunjung)
- Tombol logout

---

### 🗑️ Menghapus Proyek

**Langkah-langkah:**
1. Buka detail proyek yang ingin dihapus
2. Pastikan Anda adalah **pemilik proyek**
3. Scroll ke bagian **"Aksi Mahasiswa"** di sidebar
4. Klik tombol **"Hapus Proyek"** (ikon trash)
5. Konfirmasi penghapusan
6. ⚠️ **Peringatan:** Tindakan ini tidak dapat dibatalkan

---

### 🔗 Share Proyek

**Langkah-langkah:**
1. Buka detail proyek yang ingin dibagikan
2. Klik tombol **"Bagikan"** (ikon share)
3. Jika browser mendukung Web Share API:
   - Dialog share akan muncul
   - Pilih aplikasi untuk share
4. Jika tidak mendukung:
   - Link akan otomatis di-copy ke clipboard
   - Notifikasi "Link berhasil disalin" akan muncul

---

### 📱 Responsivitas

Aplikasi sudah **responsive** dan dapat digunakan di:
- 💻 **Desktop** (≥1024px) - Layout penuh dengan sidebar
- 📱 **Tablet** (768px - 1023px) - Layout adaptif
- 📱 **Mobile** (<768px) - Layout mobile-friendly

**Fitur Mobile:**
- Sidebar filter dapat di-toggle
- Navigation yang mudah diakses
- Touch-friendly buttons

---

### ⚡ Tips & Shortcuts

1. **Keyboard Shortcuts:**
   - `Ctrl+Enter` / `Cmd+Enter` - Kirim komentar cepat

2. **Draft Auto-Save:**
   - Form proyek otomatis tersimpan sebagai draft
   - Draft tersimpan di localStorage perangkat

3. **Live Preview:**
   - Saat membuat proyek, lihat preview di sidebar kanan
   - Preview update real-time saat mengetik

4. **Filter Kombinasi:**
   - Bisa menggunakan search + filter bersamaan
   - Hasil akan difilter berdasarkan semua kriteria

---

## ⚠️ REMINDER: Siapa yang Harus Daftar?

### ✅ **HARUS DAFTAR** (Registrasi Diperlukan)

#### 1. **Mahasiswa Baru**
Jika Anda adalah mahasiswa yang ingin:
- ➕ Membuat dan mengunggah proyek
- 💬 Memberikan komentar pada proyek
- ❤️ Memberikan endorsement pada proyek
- 📊 Melihat statistik pribadi

**Cara Daftar:**
1. Buka halaman login (`http://localhost:5173/`)
2. Klik tab **"Daftar"**
3. Isi form registrasi:
   - Nama Lengkap
   - NIM (minimal 6 digit angka)
   - Jurusan
   - Email kampus (`@kampus.ac.id` - **WAJIB**)
   - Password (minimal 8 karakter)
   - Konfirmasi Password
   - Pilih **"Mahasiswa"** sebagai role
4. Klik **"Kirim Kode Verifikasi"**
5. Masukkan kode OTP 6 digit yang diterima
6. Klik **"Verifikasi & Daftar"**
7. ✅ Akun berhasil dibuat, langsung login otomatis

#### 2. **Dosen Baru**
Jika Anda adalah dosen yang ingin:
- 👨‍🏫 Review dan verifikasi proyek mahasiswa
- ✅ Mempublikasikan proyek
- 📝 Memberikan catatan review
- 🔄 Mengembalikan proyek untuk revisi

**Cara Daftar:**
1. Buka halaman login (`http://localhost:5173/`)
2. Klik tab **"Daftar"**
3. Isi form registrasi (sama seperti mahasiswa)
4. Pilih **"Dosen"** sebagai role
5. Verifikasi email dengan kode OTP
6. ✅ Akun berhasil dibuat dengan **badge verifikasi otomatis** (✔)

---

### ❌ **TIDAK PERLU DAFTAR** (Langsung Bisa Digunakan)

#### 1. **Pengunjung (Guest Mode)**
Jika Anda hanya ingin:
- 👀 Melihat proyek yang sudah dipublikasikan
- 🔍 Mencari dan memfilter proyek
- 📖 Membaca detail proyek

**Cara Masuk:**
- Klik tombol **"Masuk sebagai Pengunjung"** di halaman login
- ✅ Langsung masuk tanpa registrasi/login
- ⚠️ **Pembatasan:** Tidak bisa membuat proyek, komentar, atau endorsement

#### 2. **User dengan Akun Default**
Aplikasi sudah menyediakan **3 akun default** yang bisa langsung digunakan:

| Email | Password | Role | NIM | Keterangan |
|-------|----------|------|-----|------------|
| `alya@kampus.ac.id` | `KaryaKita!2025` | Mahasiswa | 231234567 | Akun mahasiswa contoh |
| `dosen@kampus.ac.id` | `KaryaKita!2025` | Dosen | 1987654321 | Akun dosen untuk review |
| `admin@kampus.ac.id` | `KaryaKita!2025` | Admin | 000000000 | Akun admin |

**Cara Masuk:**
1. Buka halaman login
2. Masukkan **email** atau **NIM** + **password**
3. Klik **"Masuk ke KaryaKita"**
4. ✅ Langsung masuk tanpa perlu daftar

---

### 📊 **Ringkasan Quick Reference**

| Status User | Perlu Daftar? | Cara Masuk | Fitur yang Tersedia |
|-------------|---------------|------------|---------------------|
| **Mahasiswa Baru** | ✅ **YA** | Tab "Daftar" → Verifikasi Email | Semua fitur mahasiswa |
| **Dosen Baru** | ✅ **YA** | Tab "Daftar" → Pilih Role Dosen | Semua fitur dosen + verifikasi otomatis |
| **Pengunjung** | ❌ **TIDAK** | Klik "Masuk sebagai Pengunjung" | Hanya melihat proyek publik |
| **User Default** | ❌ **TIDAK** | Login dengan email/NIM + password | Sesuai role masing-masing |

---

### 🔑 **Syarat Registrasi**

**Email:**
- ✅ Harus menggunakan domain `@kampus.ac.id`
- ❌ Email domain lain tidak diterima

**NIM/NIP:**
- ✅ Minimal 6 digit angka
- ✅ Harus unik (tidak boleh duplikat)

**Password:**
- ✅ Minimal 8 karakter
- ✅ Harus sama dengan konfirmasi password

**Verifikasi:**
- ✅ Kode OTP 6 digit dikirim ke email
- ✅ Kode berlaku selama 15 menit

---

### 💡 **Tips**

1. **Untuk Testing Cepat:**
   - Gunakan akun default (`alya@kampus.ac.id` atau `dosen@kampus.ac.id`)
   - Atau gunakan mode pengunjung untuk melihat proyek

2. **Untuk Penggunaan Real:**
   - Daftar sebagai Mahasiswa jika ingin membuat proyek
   - Daftar sebagai Dosen jika ingin review proyek

3. **Lupa Password:**
   - Gunakan fitur **"Lupa Password"** di tab login
   - Verifikasi email dengan kode OTP
   - Buat password baru

---

## 🗄️ Database

### Struktur Database

#### Tabel `users`
- `id` (TEXT PRIMARY KEY)
- `email` (TEXT UNIQUE NOT NULL)
- `nim` (TEXT NOT NULL)
- `nim_normalized` (TEXT UNIQUE NOT NULL)
- `password_hash` (TEXT NOT NULL)
- `name` (TEXT NOT NULL)
- `department` (TEXT NOT NULL)
- `role` (TEXT DEFAULT 'Mahasiswa')
- `verified` (INTEGER DEFAULT 0)
- `avatar_color` (TEXT DEFAULT '#2F80ED')
- `total_projects` (INTEGER DEFAULT 0)
- `total_endorsements` (INTEGER DEFAULT 0)
- `popular_project` (TEXT)
- `created_at` (TEXT)

#### Tabel `projects`
- `id` (TEXT PRIMARY KEY)
- `owner_id` (TEXT NOT NULL, FOREIGN KEY)
- `title` (TEXT NOT NULL)
- `summary` (TEXT NOT NULL)
- `department` (TEXT NOT NULL)
- `category` (TEXT NOT NULL)
- `status` (TEXT NOT NULL)
- `completion_date` (TEXT)
- `year` (INTEGER)
- `thumbnail` (TEXT DEFAULT '#2F80ED')
- `demo_link` (TEXT)
- `endorsements` (INTEGER DEFAULT 0)
- `created_at` (TEXT)
- `updated_at` (TEXT)

#### Tabel `project_tags`
- `project_id` (TEXT, FOREIGN KEY)
- `tag` (TEXT)
- PRIMARY KEY (project_id, tag)

#### Tabel `notifications`
- `id` (TEXT PRIMARY KEY)
- `user_id` (TEXT NOT NULL, FOREIGN KEY)
- `title` (TEXT NOT NULL)
- `message` (TEXT NOT NULL)
- `timestamp` (TEXT NOT NULL)
- `read` (INTEGER DEFAULT 0)
- `created_at` (TEXT)

#### Tabel `sessions`
- `token` (TEXT PRIMARY KEY)
- `user_id` (TEXT, FOREIGN KEY)
- `is_guest` (INTEGER DEFAULT 0)
- `issued_at` (INTEGER NOT NULL)
- `expires_at` (INTEGER NOT NULL)

### Database Commands

```bash
# Reset database (hapus semua data)
cd server
npm run reset-db

# Migration (buat struktur tabel)
npm run migrate

# Seed (isi data awal)
npm run seed
```

## 👥 Perbedaan User Mahasiswa dan Dosen

### **Mahasiswa**

**Hak Akses:**
- ✅ Dapat membuat dan mengunggah proyek baru
- ✅ Dapat melihat proyek sendiri yang masih *Menunggu Review* atau *Perlu Revisi*
- ✅ Dapat melihat semua proyek yang sudah dipublikasikan
- ✅ Dapat memberikan komentar dan endorsement pada proyek publik
- ✅ Dapat melihat catatan review dosen untuk proyeknya sendiri
- ✅ Dapat mengirim ulang proyek yang ditolak setelah revisi

**Pembatasan:**
- ❌ Proyek yang dibuat otomatis berstatus *Menunggu Review* dan tidak langsung publik
- ❌ Tidak dapat melihat proyek mahasiswa lain yang masih pending
- ❌ Tidak dapat memverifikasi atau mempublikasikan proyek sendiri
- ❌ Tidak memiliki badge verifikasi otomatis saat registrasi

**Alur Kerja:**
1. Buat proyek → Status: *Menunggu Review*
2. Dosen meninjau → Status: *Dipublikasikan* atau *Perlu Revisi*
3. Jika ditolak → Revisi sesuai catatan → Kirim ulang untuk review

### **Dosen**

**Hak Akses:**
- ✅ Dapat melihat **semua proyek** termasuk yang masih pending
- ✅ Dapat membuat proyek yang langsung dipublikasikan tanpa review
- ✅ Dapat memverifikasi dan mempublikasikan proyek mahasiswa
- ✅ Dapat menolak proyek dengan memberikan catatan revisi
- ✅ Dapat melihat dan menulis catatan review untuk semua proyek
- ✅ Memiliki kartu khusus "Menunggu Review" di dashboard
- ✅ Otomatis terverifikasi (badge ✔) saat registrasi

**Fitur Khusus:**
- Panel "Aksi Dosen" di halaman detail proyek untuk approve/reject
- Akses ke semua proyek pending dari berbagai mahasiswa
- Dapat mengembalikan proyek yang sudah dipublikasikan untuk revisi

**Alur Kerja:**
1. Lihat daftar proyek *Menunggu Review* di dashboard
2. Buka detail proyek → Tinjau konten dan metadata
3. Pilih aksi:
   - **Setujui & Publikasikan** → Proyek langsung terlihat publik
   - **Tolak & Beri Catatan** → Proyek dikembalikan ke mahasiswa dengan catatan

### **Perbandingan Singkat**

| Fitur | Mahasiswa | Dosen |
|-------|-----------|-------|
| Status Verifikasi | Manual (setelah review) | Otomatis saat registrasi |
| Publikasi Proyek | Perlu approval dosen | Langsung publik |
| Akses Proyek Pending | Hanya proyek sendiri | Semua proyek pending |
| Review & Verifikasi | Tidak bisa | Bisa approve/reject |
| Catatan Review | Hanya melihat (proyek sendiri) | Bisa melihat & menulis (semua) |
| Dashboard Khusus | Banner status proyek sendiri | Kartu "Menunggu Review" |

## 🔌 API Endpoints (Server)

### Authentication
- `POST /api/auth/register` - Registrasi user baru
- `POST /api/auth/login` - Login dengan email/NIM
- `POST /api/auth/logout` - Logout
- `POST /api/auth/guest` - Masuk sebagai guest
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get semua proyek (dengan filter)
- `GET /api/projects/:id` - Get detail proyek
- `POST /api/projects` - Buat proyek baru
- `PUT /api/projects/:id` - Update proyek
- `DELETE /api/projects/:id` - Hapus proyek
- `POST /api/projects/:id/endorse` - Endorse/unendorse proyek

### Notifications
- `GET /api/notifications` - Get semua notifikasi user
- `PUT /api/notifications/:id/read` - Tandai notifikasi sebagai dibaca

## 📦 Build Produksi

```bash
# Build frontend
npm run build

# Output akan berada di folder dist/
# File-file akan di-optimize dan di-minify
```

## 🧪 Pengujian

### Manual Testing Checklist

- [ ] Registrasi akun baru (Mahasiswa & Dosen)
- [ ] Login dengan email kampus
- [ ] Login dengan NIM
- [ ] Mode pengunjung
- [ ] Tambah proyek baru
- [ ] Edit proyek
- [ ] Hapus proyek
- [ ] Upload gambar dan dokumen
- [ ] Filter dan pencarian
- [ ] Endorsement proyek
- [ ] Komentar pada proyek
- [ ] Review proyek sebagai dosen
- [ ] Approve/reject proyek
- [ ] Notifikasi real-time
- [ ] Responsivitas mobile/desktop

### Linting

```bash
npm run lint
```

## 🔧 Troubleshooting

### Database tidak terhubung
```bash
cd server
npm run migrate  # Pastikan struktur tabel sudah dibuat
```

### Port sudah digunakan
Ubah port di `vite.config.js` (frontend) atau `server/src/config/env.js` (backend)

### localStorage penuh
- Hapus data lama di browser DevTools > Application > Local Storage
- Atau gunakan `npm run reset-db` untuk reset database

### Error saat build
```bash
rm -rf node_modules dist
npm install
npm run build
```

## 📝 Catatan Penting

- **Data Storage**: Semua data (akun, proyek, notifikasi) disimpan di `localStorage` browser dan database SQLite
- **Password**: Password di-hash menggunakan bcrypt dengan salt rounds 10
- **Session**: Session berlaku selama 120 menit (2 jam)
- **File Upload**: Maksimal 5 gambar dan 1 dokumen per proyek, masing-masing maksimal 20MB
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge) versi terbaru

## 🚧 Langkah Selanjutnya (Roadmap)

- [ ] Integrasi backend API yang lebih robust
- [ ] Implementasi upload file riil (dengan storage service)
- [ ] Notifikasi waktu nyata (WebSocket)
- [ ] Automasi pengujian (Unit tests dengan Vitest, E2E dengan Playwright)
- [ ] Integrasi SSO kampus
- [ ] Rate limiting dan security headers
- [ ] Audit trail dan logging terpusat
- [ ] PWA support (Progressive Web App)
- [ ] Dark mode
- [ ] Internationalization (i18n)

## 👨‍💻 Kontribusi

1. Fork repository
2. Buat branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

Proyek ini menggunakan lisensi MIT. Lihat file `LICENSE` untuk detail lebih lanjut.

## 📞 Kontak & Support

- **Repository**: [GitHub](https://github.com/your-org/karyakita-web)
- **Issues**: [GitHub Issues](https://github.com/your-org/karyakita-web/issues)
- **Email**: support@karyakita.com

---

**Dibuat dengan ❤️ untuk memfasilitasi showcase karya terbaik mahasiswa**
