import { ShieldCheck } from '@phosphor-icons/react';
import LegalPage from '../components/LegalPage';

const SECTIONS = [
  {
    h: 'Data yang kami proses',
    p: 'File yang Anda upload diteruskan oleh server kami ke Catbox.moe untuk dihosting. Server kami tidak menyimpan isi file setelah upload selesai. File sementara dihapus otomatis.',
  },
  {
    h: 'Riwayat di perangkat Anda',
    p: 'Riwayat link upload disimpan di localStorage browser Anda sendiri, bukan di server kami. Menghapus riwayat atau data browser akan menghilangkannya.',
  },
  {
    h: 'Pihak ketiga',
    p: 'File yang diupload tunduk pada kebijakan Catbox.moe sebagai penyedia hosting. Kami tidak membagikan data Anda ke pihak lain untuk iklan atau pelacakan.',
  },
  {
    h: 'Keamanan',
    p: 'Kami membatasi ukuran file, memblokir ekstensi berbahaya, dan memakai koneksi terenkripsi. Meski begitu, jangan upload data sangat sensitif karena link bersifat publik bagi siapa pun yang memilikinya.',
  },
  {
    h: 'Kontak',
    p: 'Pertanyaan soal privasi dapat disampaikan melalui kanal resmi tempat aplikasi ini dipublikasikan.',
  },
];

export default function Privacy() {
  return (
    <LegalPage
      icon={<ShieldCheck size={24} weight="bold" aria-hidden="true" />}
      eyebrow="Kebijakan privasi"
      title="Kebijakan Privasi."
      lead="Terakhir diperbarui: September 2026."
      sections={SECTIONS}
    />
  );
}
