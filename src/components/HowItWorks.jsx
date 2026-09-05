import Reveal from './Reveal';

export default function HowItWorks() {
  return (
    <section id="cara" className="mx-auto max-w-[1200px] px-5 pt-16 pb-6">
      <Reveal>
        <h2 className="m-0 max-w-[22ch] text-[clamp(24px,3vw,34px)] font-bold tracking-[-0.03em] text-ink">
          Tiga langkah, tanpa daftar.
        </h2>
        <p className="m-0 mt-2.5 max-w-[65ch] leading-relaxed text-muted">
          File dikirim ke Catbox.moe lewat backend agar cepat dan stabil.
        </p>
      </Reveal>

      <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-[1.4fr_1fr]">
        <Reveal className="card card-hover group overflow-hidden">
          <img
            src="https://picsum.photos/seed/noisy-uploader/900/520"
            alt="Ilustrasi upload file ke cloud"
            loading="lazy"
            className="img-zoom block h-[230px] w-full object-cover"
          />
          <div className="p-5">
            <h3 className="m-0 text-lg font-semibold tracking-[-0.01em] text-ink">Pilih file</h3>
            <p className="m-0 mt-1.5 leading-relaxed text-muted">
              Seret file atau klik pilih. Nama, ukuran, dan tipe langsung tampil. Batas 200MB per
              file, format umum didukung.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-4">
          <Reveal className="card card-hover p-5">
            <h3 className="m-0 text-lg font-semibold tracking-[-0.01em] text-ink">
              Upload dengan progress
            </h3>
            <p className="m-0 mt-1.5 leading-relaxed text-muted">
              Backend meneruskan ke{' '}
              <span className="font-mono text-[12.5px] text-accent">catbox.moe/user/api.php</span>{' '}
              dengan progress persen real-time.
            </p>
          </Reveal>
          <Reveal className="card card-hover p-5">
            <h3 className="m-0 text-lg font-semibold tracking-[-0.01em] text-ink">
              Salin dan bagikan
            </h3>
            <p className="m-0 mt-1.5 leading-relaxed text-muted">
              Link <span className="font-mono text-[12.5px] text-accent">files.catbox.moe</span>{' '}
              permanen langsung bisa dibuka dan dibagikan ke siapa saja.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
