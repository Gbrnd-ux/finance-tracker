# FinTrack - Personal Finance & Budget Tracker

FinTrack adalah aplikasi manajemen keuangan pribadi *full-stack* yang membantu pengguna mencatat pemasukan, merencanakan alokasi *budget* secara otomatis, dan melacak tagihan bulanan. Aplikasi ini dirancang dengan antarmuka yang modern, responsif, dan dilengkapi dengan pengingat cerdas (H-3) sebelum tagihan jatuh tempo.

## 🌟 Fitur Utama
- **Dashboard Interaktif**: Visualisasi ringkasan data keuangan secara *real-time* menggunakan grafik analitik.
- **Alokasi Budget Otomatis**: Fitur cerdas yang otomatis membagi total pemasukan baru ke dalam berbagai "pos uang" (misal: Kebutuhan, Tabungan, Hiburan) berdasarkan rasio persentase yang bisa diatur secara dinamis.
- **Pengingat Tagihan (Cron Jobs)**: Manajemen tagihan yang secara otomatis memindai tenggat waktu dan menembak notifikasi pengingat via Telegram tepat 3 hari sebelum tagihan jatuh tempo.
- **Sistem Autentikasi Terpusat**: Proteksi privasi data *(Multi-tenancy)* menggunakan NextAuth.js agar data keuangan setiap pengguna terisolasi dengan aman.
- **Desain Premium & Mobile-Ready**: Pengalaman UI/UX yang setara dengan aplikasi *native* dengan status *loading*, *empty state*, dan desain *mobile-first*.

## 🛠 Tech Stack
- **Frontend**: Next.js 16 (App Router), React, Tailwind CSS, Recharts.
- **Backend**: Next.js API Routes, Server Actions.
- **Database**: PostgreSQL (via Neon) terhubung lewat Prisma ORM.
- **Infrastruktur**: Vercel (Hosting & Serverless Cron Jobs).

## 📸 Screenshot Aplikasi
*(Tambahkan gambar screenshot aplikasi di bawah ini)*

1. `![Dashboard UI](/public/screenshot-dashboard.png)` 
   *Dashboard interaktif dengan grafik alokasi.*
2. `![Pengaturan Budget](/public/screenshot-budget.png)` 
   *Halaman manajemen persentase budget yang responsif.*
3. `![Bot Telegram](/public/screenshot-telegram.png)` 
   *Notifikasi otomatis H-3 penagihan tagihan via Telegram Bot.*

## 🚀 Cara Menjalankan Secara Lokal

1. **Clone repository ini**
   ```bash
   git clone https://github.com/Gbrnd-ux/finance-tracker.git
   cd finance-tracker
   ```

2. **Instal dependensi**
   ```bash
   npm install
   ```

3. **Siapkan Environment Variables**
   Ubah nama file `.env.example` menjadi `.env.local` atau `.env`, dan lengkapi URL Database Anda:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/fintrack"
   NEXTAUTH_SECRET="buat_string_acak_disini"
   ```

4. **Siapkan Database & Jalankan**
   ```bash
   npx prisma db push
   npm run dev
   ```
   Buka `http://localhost:3000` di browser Anda!

---
*Didesain dan dikembangkan oleh [Gbrnd-ux](https://github.com/Gbrnd-ux).*
