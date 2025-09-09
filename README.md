# PantauBatam - Aplikasi Streaming CCTV Kota Batam

Aplikasi web untuk melihat streaming CCTV publik di kota Batam. Proyek ini dibuat menggunakan React, TypeScript, dan Tailwind CSS.

## Fitur Utama

- 🎥 Streaming video CCTV menggunakan format HLS
- 📱 Tampilan responsif (mobile, tablet, dan desktop)
- 🔍 Pencarian kamera berdasarkan nama
- 📊 Control Center dengan kemampuan menampilkan beberapa kamera sekaligus
- 🖥️ Grid layout yang dapat dikonfigurasi (1, 2, 4, 9, atau 16 kamera)
- ⌨️ **Keyboard Navigation** - Navigasi kamera dengan arrow keys (desktop layout 1)
- 🖱️ **Enhanced Drag & Drop** - Drag kamera dari sidebar ke preview dan reposisi antar preview
- 📱 **Mobile Fullscreen** - Individual camera fullscreen dengan double-tap gesture
- 🎯 **Auto-scroll** - Sidebar dan carousel mengikuti kamera aktif
- 📁 Backend menggunakan Supabase (PostgreSQL)

## Teknologi yang Digunakan

- React 19
- TypeScript
- Tailwind CSS
- React Router DOM
- HLS.js untuk streaming video
- Supabase untuk backend dan database
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

### Mobile

- Tampilan galleri kamera dengan detail pada halaman terpisah
- **Individual camera fullscreen** dengan double-tap gesture
- **Rotation guide** untuk landscape viewing
- **Auto-scroll carousel** ke kamera aktif

### Desktop

- Tampilan galleri kamera dengan link ke Control Center
- **Grid view** dengan kemampuan menampilkan beberapa kamera sekaligus
- **Keyboard navigation** dengan arrow keys (layout 1)
- **Drag & drop** dari sidebar ke preview dan reposisi antar preview
- **Auto-scroll sidebar** mengikuti kamera aktif saat keyboard navigation

## Mode Development vs Production

Aplikasi menggunakan Supabase sebagai backend untuk menyimpan data kamera dan konfigurasi. Data kamera dapat dikelola melalui Supabase dashboard atau melalui API yang tersedia.

## Build & Deploy

```bash
# Build untuk production
npm run build

# Preview build hasil
npm run preview
```

Hasil build akan tersimpan di folder `dist/` dan siap deploy ke hosting static seperti Vercel, Netlify, atau server web lainnya.

## Lisensi

MIT License
