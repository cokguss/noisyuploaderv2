export const FORMATS = [
  {
    icon: 'ph-file-image',
    name: 'Gambar',
    ext: 'JPG | PNG | GIF | WEBP | SVG',
    big: true,
  },
  {
    icon: 'ph-file-video',
    name: 'Video',
    ext: 'MP4 | WEBM',
    tint: true,
  },
  {
    icon: 'ph-file-audio',
    name: 'Audio',
    ext: 'MP3 | WAV | OGG',
  },
  {
    icon: 'ph-file-text',
    name: 'Dokumen',
    ext: 'PDF | TXT | JSON | HTML | CSS | JS',
  },
  {
    icon: 'ph-file-archive',
    name: 'Arsip',
    ext: 'ZIP | RAR | 7Z',
  },
];

export const FAQS = [
  {
    q: 'Apakah gratis dan perlu daftar?',
    a: 'Gratis dan tanpa daftar. Upload anonim ke Catbox hingga 200MB per file.',
  },
  {
    q: 'Berapa lama link aktif?',
    a: 'Link files.catbox.moe bersifat permanen selama tidak melanggar aturan Catbox. Simpan link baik-baik karena riwayat hanya tersimpan di browser ini.',
  },
  {
    q: 'File apa yang ditolak?',
    a: 'Executable seperti .exe, .bat, .cmd, .msi, dan .ps1 diblokir. File di atas 200MB juga ditolak server.',
  },
  {
    q: 'Apakah file saya privat?',
    a: 'Siapa pun yang punya link bisa membuka file. Jangan upload data sangat sensitif dan jangan bagikan link ke orang yang tidak dikenal.',
  },
];

export const NAV_LINKS = [
  { label: 'Upload', hash: '#upload' },
  { label: 'Cara kerja', hash: '#cara' },
  { label: 'Format', hash: '#format' },
  { label: 'FAQ', hash: '#faq' },
];
