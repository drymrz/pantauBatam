# PantauBatam - Aplikasi Streaming CCTV Kota Batam

Aplikasi web untuk melihat streaming CCTV publik di kota Batam. Proyek ini dibuat menggunakan React, TypeScript, dan Tailwind CSS.

## Fitur Utama

- 🎥 Streaming video CCTV menggunakan format HLS
- 📱 Tampilan responsif (mobile, tablet, dan desktop)
- 🔍 Pencarian kamera berdasarkan nama dan lokasi
- 📊 Control Center dengan kemampuan menampilkan beberapa kamera sekaligus
- 🖥️ Grid layout yang dapat dikonfigurasi (1, 2, 4, 8, atau 16 kamera)
- 📁 Persiapan untuk integrasi dengan database MySQL

## Teknologi yang Digunakan

- React 19
- TypeScript
- Tailwind CSS
- React Router DOM
- HLS.js untuk streaming video
- Vite sebagai build tool

## Cara Menjalankan Aplikasi

### Prasyarat

- Node.js versi 20.19+ atau 22.12+
- npm atau yarn

### Langkah-langkah

1. Clone repository
```bash
git clone https://github.com/username/pantauBatam.git
cd pantauBatam
```

2. Install dependensi
```bash
npm install
# atau
yarn install
```

3. Jalankan aplikasi dalam mode development
```bash
npm run dev
# atau
yarn dev
```

4. Buka browser dan akses `http://localhost:5173`

## Struktur Folder

- `/src` - Kode sumber utama
  - `/components` - Komponen React yang dapat digunakan kembali
  - `/pages` - Halaman utama aplikasi
  - `/hooks` - Custom React hooks
  - `/services` - Layanan untuk mendapatkan data kamera
  - `/types` - Definisi tipe TypeScript
  - `/config` - Konfigurasi aplikasi
  - `/assets` - Gambar dan aset statis lainnya

## Fitur Responsif

- **Mobile**: Tampilan galleri kamera dengan detail pada halaman terpisah
- **Tablet/Desktop**: Tampilan galleri kamera dengan link ke Control Center, serta kemampuan menampilkan beberapa kamera sekaligus dalam grid

## Mode Development vs Production

Saat ini, aplikasi menggunakan data dummy untuk kamera. Untuk produksi, ubah flag `useMySQL` di `databaseService.ts` menjadi `true` dan implementasikan koneksi MySQL.

## Lisensi

MIT License
