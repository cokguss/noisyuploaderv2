import { X } from '@phosphor-icons/react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect } from 'react';

const EASE = [0.23, 1, 0.32, 1];

export default function DonasiModal({ open, onClose }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] grid place-items-center bg-bg/70 p-5 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Donasi QRIS"
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            className="card w-full max-w-[440px] max-h-[92dvh] overflow-y-auto p-5 sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow">donasi</p>
              <button
                type="button"
                onClick={onClose}
                className="grid h-8 w-8 cursor-pointer place-items-center rounded-btn border border-line bg-transparent text-ink transition-colors hover:border-accent hover:text-accent"
                aria-label="Tutup donasi"
              >
                <X size={15} weight="bold" aria-hidden="true" />
              </button>
            </div>
            <h3 className="m-0 mt-3 text-xl font-bold tracking-[-0.02em] text-ink">
              Dukung Noisy Uploader V2
            </h3>
            <p className="m-0 mt-1.5 text-sm leading-relaxed text-muted">
              Donasi membantu menjaga layanan ini tetap gratis untuk semua. Scan QRIS untuk memberi
              dukungan.
            </p>
            <img
              src="/donasi-qris.png"
              alt="QRIS donasi Noisy Uploader V2"
              className="mx-auto mt-5 block max-h-[50dvh] w-auto max-w-[min(100%,320px)] rounded-input border border-line bg-white p-2"
            />
            <p className="m-0 mt-3 text-center font-mono text-[11px] text-muted">
              GoPay · OVO · DANA · ShopeePay · m-Banking
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
