import { CloudArrowUp } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-6 border-t border-line px-5 pb-10 pt-8">
      <div className="mx-auto grid max-w-[1200px] gap-2">
        <div className="flex items-center justify-center gap-2 text-ink">
          <span className="grid h-6 w-6 place-items-center rounded-btn bg-accent text-accent-ink">
            <CloudArrowUp size={13} weight="bold" aria-hidden="true" />
          </span>
          <p className="m-0 text-sm font-semibold tracking-tight">
            Noisy <strong className="font-extrabold">Uploader</strong>{' '}
            <span className="rounded-btn border border-accent/40 bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] font-bold leading-none tracking-wider text-accent">
              V2
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm font-semibold">
          <Link to="/privacy.html" className="text-ink no-underline hover:text-accent">
            Kebijakan Privasi
          </Link>
          <span aria-hidden="true" className="text-muted">
            /
          </span>
          <Link to="/terms.html" className="text-ink no-underline hover:text-accent">
            Ketentuan Layanan
          </Link>
        </div>
        <p className="m-0 mx-auto max-w-[52ch] text-center text-sm text-muted">
          Upload cepat dengan link permanen. Gratis tanpa daftar, maksimal 200MB per file.
        </p>
        <p className="m-0 text-center font-mono text-xs text-muted">© 2026 Noisy Uploader V2</p>
      </div>
    </footer>
  );
}
