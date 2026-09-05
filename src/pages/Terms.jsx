import { FileText } from '@phosphor-icons/react';
import LegalPage from '../components/LegalPage';

const SECTIONS = [
  {
    h: 'Layanan',
    p: 'Noisy Uploader menyediakan upload file anonim gratis hingga 200MB per file dengan link publik permanen dari Catbox.moe.',
  },
  {
    h: 'Aturan pakai',
    p: 'Dilarang mengupload konten ilegal, malware, atau file yang melanggar hak cipta dan privasi orang lain. Ekstensi executable (.exe, .bat, .msi, dan sejenisnya) diblokir otomatis.',
  },
  {
    h: 'Ketersediaan link',
    p: 'Kepermanenan link mengikuti kebijakan Catbox.moe. Kami tidak menjamin file tersimpan selamanya dan dapat menghapus akses bila ada penyalahgunaan.',
  },
  {
    h: 'Batas tanggung jawab',
    p: 'Layanan diberikan apa adanya tanpa jaminan. Anda bertanggung jawab atas file yang diupload dan link yang dibagikan.',
  },
  {
    h: 'Perubahan',
    p: 'Ketentuan ini dapat diperbarui sewaktu-waktu. Versi terbaru selalu tampil di halaman ini.',
  },
];

export default function Terms() {
  return (
    <LegalPage
      icon={<FileText size={24} weight="bold" aria-hidden="true" />}
      eyebrow="Ketentuan layanan"
      title="Ketentuan Layanan."
      lead="Terakhir diperbarui: September 2026. Dengan memakai layanan ini, Anda menyetujui ketentuan berikut."
      sections={SECTIONS}
    />
  );
}
