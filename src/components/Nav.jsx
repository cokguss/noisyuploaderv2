import { CloudArrowUp, List, Moon, Sun, X } from '@phosphor-icons/react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../data';
import { useTheme } from '../lib/theme';

const EASE = [0.23, 1, 0.32, 1];

function scrollToHash(hash) {
  const el = document.querySelector(hash);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Nav() {
  const { theme, toggle } = useTheme();
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const onHome = pathname === '/';

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const go = (e, hash) => {
    if (onHome) {
      e.preventDefault();
      scrollToHash(hash);
    }
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-4 px-5">
        <a
          href={onHome ? '#top' : '/'}
          onClick={(e) => go(e, '#top')}
          className="mr-auto flex items-center gap-2.5 text-ink no-underline"
          aria-label="Noisy Uploader V2"
        >
          <span className="grid h-8 w-8 place-items-center rounded-btn bg-accent text-accent-ink">
            <CloudArrowUp size={17} weight="bold" aria-hidden="true" />
          </span>
          <span className="whitespace-nowrap text-[15px] font-semibold tracking-tight">
            Noisy <strong className="font-extrabold">Uploader</strong>{' '}
            <span className="rounded-btn border border-accent/40 bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] font-bold leading-none tracking-wider text-accent">
              V2
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Navigasi utama">
          {NAV_LINKS.map((l) => (
            <a
              key={l.hash}
              href={onHome ? l.hash : '/' + l.hash}
              onClick={(e) => go(e, l.hash)}
              className="nav-link font-mono text-[13px] text-muted no-underline transition-colors hover:text-accent"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggle}
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-btn border border-line bg-transparent text-ink transition-colors hover:border-accent hover:text-accent"
            aria-label={theme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
          >
            <motion.span
              key={theme}
              initial={reduce ? false : { opacity: 0, transform: 'rotate(-90deg) scale(0.7)' }}
              animate={{ opacity: 1, transform: 'rotate(0deg) scale(1)' }}
              transition={{ duration: 0.2, ease: EASE }}
              className="grid place-items-center"
            >
              {theme === 'dark' ? (
                <Moon size={16} weight="bold" aria-hidden="true" />
              ) : (
                <Sun size={16} weight="bold" aria-hidden="true" />
              )}
            </motion.span>
          </button>
          <a
            href={onHome ? '#upload' : '/#upload'}
            onClick={(e) => go(e, '#upload')}
            className="btn btn-primary hidden sm:inline-flex"
          >
            Upload File
          </a>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-btn border border-line bg-transparent text-ink transition-colors hover:border-accent hover:text-accent md:hidden"
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X size={16} weight="bold" aria-hidden="true" />
            ) : (
              <List size={16} weight="bold" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            key="mobile-menu"
            initial={reduce ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="absolute inset-x-0 top-16 border-b border-line bg-bg/95 backdrop-blur-md md:hidden"
            aria-label="Menu navigasi"
          >
            <div className="mx-auto grid grid-cols-1 max-w-[1200px] gap-1 px-5 py-3">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.hash}
                  href={onHome ? l.hash : '/' + l.hash}
                  onClick={(e) => go(e, l.hash)}
                  className="rounded-input px-2 py-2.5 font-mono text-[13px] text-muted no-underline transition-colors hover:bg-panel2 hover:text-accent"
                >
                  {l.label}
                </a>
              ))}
              <a
                href={onHome ? '#upload' : '/#upload'}
                onClick={(e) => go(e, '#upload')}
                className="btn btn-primary btn-sm mt-1 w-full"
              >
                Upload File
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
