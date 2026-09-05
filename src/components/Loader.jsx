import { CloudArrowUp } from '@phosphor-icons/react';
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react';
import { useEffect } from 'react';

const EASE = [0.23, 1, 0.32, 1];

export default function Loader({ onDone }) {
  const reduce = useReducedMotion();
  const progress = useMotionValue(0);
  const barScale = useTransform(progress, (v) => 'scaleX(' + v + ')');

  useEffect(() => {
    if (reduce) {
      const t = setTimeout(onDone, 700);
      return () => clearTimeout(t);
    }
    let alive = true;
    const controls = animate(progress, 1, {
      duration: 1.1,
      ease: 'linear',
      onComplete: () => {
        if (alive) setTimeout(onDone, 200);
      },
    });
    return () => {
      alive = false;
      controls.stop();
    };
  }, [reduce, progress, onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[80] grid place-items-center bg-bg"
      initial={false}
      exit={reduce ? { opacity: 0 } : { y: '-100%' }}
      transition={{ duration: reduce ? 0.3 : 0.55, ease: EASE }}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-5">
        <motion.span
          initial={reduce ? false : { scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="grid h-14 w-14 place-items-center rounded-input bg-accent text-accent-ink"
        >
          <CloudArrowUp size={28} weight="bold" aria-hidden="true" />
        </motion.span>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: EASE }}
          className="m-0 text-lg font-bold tracking-tight text-ink"
        >
          Noisy <span className="font-extrabold text-accent">Uploader</span>{' '}
          <span className="rounded-btn border border-accent/40 bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] font-bold leading-none tracking-wider text-accent">
            V2
          </span>
        </motion.p>
        <div className="h-[3px] w-44 overflow-hidden rounded-full bg-panel2" aria-hidden="true">
          <motion.div className="h-full origin-left bg-accent" style={{ transform: barScale }} />
        </div>
      </div>
    </motion.div>
  );
}
