<div align="center">

# Noisy Uploader V2

**Upload file & dapatkan link permanen dalam hitungan detik**

Gambar · Video · Audio · Dokumen — hingga 200MB

[![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)](https://vitejs.dev)
[![Node](https://img.shields.io/badge/Node-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![License](https://img.shields.io/badge/Penggunaan-pribadi-a855f7)](#)

</div>

---

## ✨ Fitur

| Kemampuan | Detail |
|----------|--------|
| **Upload instan** | Seret & lepas file, langsung dapat link Catbox permanen |
| **Batas ukuran** | Hingga 200MB per file, format umum didukung |
| **Riwayat perangkat** | Tersimpan di localStorage, salin / hapus per item |
| **Keamanan** | Eksekutabel (.exe, .bat, .msi, dll.) diblokir otomatis |
| **Anti-scraping** | robots.txt + rate limit per IP, IP developer bebas batas |

**Fitur umum**

- 🎨 Tampilan dark/light dengan aksen neon lime, animasi Motion yang halus
- 📊 Progress upload real-time, demo live di hero
- 🕘 Riwayat upload per perangkat dengan tombol salin & hapus per item
- 📱 Responsif penuh — seluruh jenis HP hingga desktop
- 💳 Donasi QRIS (GoPay, OVO, DANA, ShopeePay, m-Banking)
- 📄 Halaman Ketentuan & Privasi terpisah

## 🚀 Menjalankan Secara Lokal

**Prasyarat:** Node.js 18+

```bash
# 1. Install dependensi
npm install

# 2. Jalankan (API + web sekaligus)
npm run dev
```

Buka **http://localhost:5173** — selesai.

> ⚠️ **Penting:** selalu gunakan `npm run dev` (bukan `vite` saja).
> API Express di port 3000 wajib berjalan agar upload ke Catbox berfungsi.

### Script yang tersedia

| Perintah | Fungsi |
|----------|--------|
| `npm run dev` | API + Vite sekaligus (pengembangan) |
| `npm run dev:api` | Hanya API Express (port 3000) |
| `npm run dev:web` | Hanya Vite |
| `npm run build` | Build produksi ke folder `dist/` |
| `npm start` | Jalankan API produksi |

## 🧠 Cara Kerja

```
Browser ──► Vite (frontend React)
   │
   ├── Upload file ──► /api/catbox-upload ──► Catbox.moe (files.catbox.moe)
   │                    ├── Multer (temp disk) → stream langsung
   │                    ├── Validasi tipe & ekstensi terlarang
   │                    └── Verifikasi ukuran link hasil (Range GET)
   │
   └── /api/health ──► status server
```

**Kenapa perlu backend?** Upload multipart ke Catbox butuh header khusus (User-Agent & Referer) yang hanya bisa dikirim dari sisi server — sekaligus menjadi lapis validasi keamanan (tipe file, ekstensi, batas ukuran).

## 📁 Struktur Proyek

```
noisyuploaderv2/
├── server.js            # API Express: /api/catbox-upload, /api/health
├── src/
│   ├── components/      # Nav, Hero (demo live), UploadTool, Developer, Donasi, dll.
│   ├── pages/           # Ketentuan & Privasi
│   ├── lib/             # upload.js (riwayat), theme.jsx
│   └── index.css        # Design system + animasi
├── public/              # robots.txt, aset QRIS donasi
├── vite.config.js       # Proxy /api/* → localhost:3000
└── package.json
```

## ☁️ Deploy

| Bagian | Hosting | Platform yang cocok |
|--------|---------|---------------------|
| Frontend (statis) | Static hosting | Vercel, Netlify, GitHub Pages |
| API Express | Node.js runtime | Vercel (serverless), Render, Railway, VPS |

**Langkah deploy:**

1. Jalankan `npm run build`, lalu hosting folder `dist/`.
2. Deploy `server.js` sebagai layanan Node (atur `PORT` sesuai platform).
3. Arahkan proxy `/api` di frontend ke URL API, atau deploy dua-duanya sekaligus via `vercel.json`.

> Tanpa API, halaman tetap tampil tapi **upload tidak berfungsi** — pastikan keduanya ter-deploy.

## ⚠️ Catatan

- File executable (.exe, .bat, .cmd, .msi, .ps1) diblokir demi keamanan.
- Link Catbox bersifat permanen selama tidak melanggar aturan Catbox.
- Riwayat hanya tersimpan di browser Anda (localStorage), bukan di server.
- Jangan upload data sangat sensitif — siapa pun yang memiliki link bisa membukanya.
- Rate limit API melindungi server dari penyalahgunaan; IP developer dapat dikecualikan lewat environment variable.

---

<div align="center">
Dibuat dengan 💜 — Noisy Uploader V2
</div>
