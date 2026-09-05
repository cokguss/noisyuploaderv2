import { GithubLogo, HandCoins, Star, TelegramLogo } from '@phosphor-icons/react';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import DonasiModal from './DonasiModal';
import Reveal from './Reveal';

const PHOTO = 'https://i.imgur.com/9z9p5td.jpeg';
const GITHUB_USER = 'cokguss';
const GITHUB_URL = 'https://github.com/cokguss';
const REPO_LIMIT = 6;
const SKIP = new Set(['Maxitech_IPAs', 'noisyverse']);

function useRepos() {
  const [state, setState] = useState({ status: 'loading', repos: [] });
  useEffect(() => {
    let alive = true;
    fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=30`, {
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('http ' + r.status))))
      .then((d) => {
        if (!alive) return;
        const repos = (Array.isArray(d) ? d : [])
          .filter((r) => !r.fork && r.name !== GITHUB_USER && !SKIP.has(r.name))
          .slice(0, REPO_LIMIT);
        setState({ status: repos.length ? 'ready' : 'empty', repos });
      })
      .catch(() => {
        if (alive) setState({ status: 'error', repos: [] });
      });
    return () => {
      alive = false;
    };
  }, []);
  return state;
}

export default function Developer() {
  const reduce = useReducedMotion();
  const { status, repos } = useRepos();
  const [donasiOpen, setDonasiOpen] = useState(false);

  return (
    <section aria-label="Developer" className="mx-auto max-w-[820px] px-5 pt-16 pb-6">
      <Reveal className="card card-hover p-6 sm:p-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
          <motion.div
            animate={reduce ? undefined : { y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="flex-none"
          >
            <img
              src={PHOTO}
              alt="Foto developer Noisy"
              loading="lazy"
              className="avatar h-24 w-24 rounded-full object-cover ring-2 ring-accent/50 ring-offset-4 ring-offset-bg sm:h-28 sm:w-28"
            />
          </motion.div>
          <div className="flex-1 text-center sm:text-left">
            <p className="eyebrow mb-2">dibuat oleh</p>
            <h3 className="m-0 text-xl font-bold tracking-[-0.02em] text-ink">Noisy</h3>
            <p className="m-0 mt-2 max-w-[48ch] leading-relaxed text-muted">
              Developer di balik Noisy Uploader V2. Bikin alat sederhana yang cepat, gratis, dan
              tanpa ribet.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <a
                href="https://t.me/noisy02"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm"
              >
                <TelegramLogo size={15} weight="bold" aria-hidden="true" />
                @noisy02
              </a>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm"
              >
                <GithubLogo size={15} weight="bold" aria-hidden="true" />
                @cokguss
              </a>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setDonasiOpen(true)}
              >
                <HandCoins size={15} weight="bold" aria-hidden="true" />
                Donasi
              </button>
            </div>
          </div>
        </div>

        <div className="mt-7 border-t border-line pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="m-0 text-base font-semibold tracking-[-0.01em] text-ink">
              Project GitHub
            </h3>
            <a
              href={GITHUB_URL + '?tab=repositories'}
              target="_blank"
              rel="noopener noreferrer"
              className="link font-mono text-xs"
            >
              lihat semua
            </a>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {status === 'loading' &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-input border border-line bg-panel2 p-4">
                  <div className="h-3 w-2/3 animate-pulse rounded bg-line/60" />
                  <div className="mt-2.5 h-2.5 w-full animate-pulse rounded bg-line/40" />
                  <div className="mt-1.5 h-2.5 w-1/2 animate-pulse rounded bg-line/40" />
                </div>
              ))}

            {status === 'ready' &&
              repos.map((r, i) => (
                <Reveal key={r.id} delay={i * 0.05}>
                  <a
                    href={r.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card card-hover flex h-full flex-col gap-1.5 p-4 no-underline"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate font-mono text-[13px] font-semibold text-ink">
                        {r.name}
                      </span>
                      <span className="flex flex-none items-center gap-1 font-mono text-[11px] text-muted">
                        <Star size={12} weight="bold" className="text-accent" aria-hidden="true" />
                        {r.stargazers_count || 0}
                      </span>
                    </span>
                    <p className="m-0 text-[13px] leading-relaxed text-muted">
                      {r.description || 'Tanpa deskripsi.'}
                    </p>
                    {r.language && (
                      <span className="mt-auto pt-1 font-mono text-[11px] text-accent">
                        {r.language}
                      </span>
                    )}
                  </a>
                </Reveal>
              ))}

            {status === 'error' && (
              <div className="rounded-input border border-line bg-panel2 p-4 text-sm leading-relaxed text-muted sm:col-span-2">
                Gagal memuat project. Kunjungi{' '}
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  github.com/cokguss
                </a>
                .
              </div>
            )}
          </div>
        </div>
      </Reveal>

      <DonasiModal open={donasiOpen} onClose={() => setDonasiOpen(false)} />
    </section>
  );
}
