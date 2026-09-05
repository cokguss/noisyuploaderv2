import { CheckCircle, CloudArrowUp } from '@phosphor-icons/react';
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react';
import { useEffect, useState } from 'react';
import FileIcon from './FileIcon';

const EASE = [0.23, 1, 0.32, 1];
const DEMOS = [
  { name: 'liburan-bali.webp', size: '2.4 MB' },
  { name: 'video-demo.mp4', size: '48.2 MB' },
  { name: 'laporan-q3.pdf', size: '3.1 MB' },
];

function DemoMiniUploader() {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState('idle'); // idle | picked | uploading | done
  const [demoIdx, setDemoIdx] = useState(0);
  const progress = useMotionValue(0);
  const pctText = useTransform(progress, (v) => Math.round(v) + '%');
  const barScale = useTransform(progress, (v) => 'scaleX(' + v / 100 + ')');
  const demo = DEMOS[demoIdx];

  useEffect(() => {
    if (reduce) return;
    let alive = true;
    const timeouts = [];
    const wait = (ms, fn) => timeouts.push(setTimeout(() => alive && fn(), ms));
    let controls = null;

    if (stage === 'idle') {
      wait(1600, () => {
        setDemoIdx((i) => (i + 1) % DEMOS.length);
        setStage('picked');
      });
    } else if (stage === 'picked') {
      wait(1400, () => {
        progress.set(0);
        setStage('uploading');
      });
    } else if (stage === 'uploading') {
      controls = animate(progress, 100, {
        duration: 2.2,
        ease: 'linear',
        onComplete: () => alive && setStage('done'),
      });
    } else if (stage === 'done') {
      wait(2400, () => setStage('idle'));
    }

    return () => {
      alive = false;
      timeouts.forEach(clearTimeout);
      controls?.stop();
    };
  }, [stage, reduce, progress]);

  const status =
    stage === 'done' ? 'done' : stage === 'uploading' ? 'uploading…' : stage === 'picked' ? 'ready' : 'idle';
  const statusColor =
    stage === 'done' || stage === 'picked'
      ? 'text-ok'
      : stage === 'uploading'
        ? 'text-accent'
        : 'text-muted';

  const transition = { duration: 0.25, ease: EASE };

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line bg-panel2 px-4 py-2.5">
        <p className="m-0 font-mono text-[11px] tracking-wide text-muted">
          noisy-uploader-v2 | upload
        </p>
        <p className={`m-0 font-mono text-[11px] tracking-wide ${statusColor}`}>{status}</p>
      </div>

      <div className="p-4">
        <div className="dropzone flex min-h-[150px] w-full flex-col items-center justify-center gap-3 rounded-input border border-dashed border-line bg-bg/40 px-4 py-6 text-center">
          <AnimatePresence mode="wait" initial={false}>
            {stage === 'idle' && (
              <motion.div
                key="idle"
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -10 }}
                transition={transition}
                className="flex flex-col items-center gap-3"
              >
                <motion.span
                  animate={reduce ? undefined : { y: [0, -6, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-accent"
                  aria-hidden="true"
                >
                  <CloudArrowUp size={30} weight="bold" />
                </motion.span>
                <p className="m-0 font-mono text-[13px] text-muted">
                  <span className="text-accent">&gt;</span> klik untuk pilih file
                </p>
                <p className="m-0 font-mono text-[11px] text-muted/70">
                  gambar, video, audio, dokumen · maks 200MB
                </p>
              </motion.div>
            )}

            {stage === 'picked' && (
              <motion.div
                key="picked"
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -10 }}
                transition={transition}
                className="flex w-full items-center gap-3 text-left"
              >
                <span className="grid h-10 w-10 flex-none place-items-center rounded-input bg-accent/15 text-accent">
                  <FileIcon name={demo.name} type="" size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="m-0 truncate text-sm font-semibold text-ink">{demo.name}</p>
                  <p className="m-0 font-mono text-[11px] text-muted">
                    {demo.size} | siap upload
                  </p>
                </div>
                <CheckCircle size={20} weight="bold" className="flex-none text-ok" aria-hidden="true" />
              </motion.div>
            )}

            {stage === 'uploading' && (
              <motion.div
                key="uploading"
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -10 }}
                transition={transition}
                className="w-full"
              >
                <div className="flex items-center justify-between gap-2 font-mono text-xs text-muted">
                  <span className="truncate">{demo.name}</span>
                  <motion.span className="flex-none text-accent">{pctText}</motion.span>
                </div>
                <div
                  className="mt-2.5 h-2.5 overflow-hidden rounded-btn border border-line bg-bg"
                  aria-hidden="true"
                >
                  <motion.div className="h-full origin-left bg-accent" style={{ transform: barScale }} />
                </div>
              </motion.div>
            )}

            {stage === 'done' && (
              <motion.div
                key="done"
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -10 }}
                transition={transition}
                className="w-full"
              >
                <div className="flex items-center gap-2 text-ok">
                  <CheckCircle size={16} weight="bold" aria-hidden="true" />
                  <span className="font-mono text-[11px]">upload selesai</span>
                </div>
                <div className="mt-2 overflow-hidden rounded-input border border-line bg-bg p-3">
                  <p className="m-0 truncate font-mono text-[12px] text-accent">
                    https://files.catbox.moe/{demo.name}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const reduce = useReducedMotion();
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.06 } },
  };
  const item = {
    hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } },
  };

  return (
    <section id="top" className="relative">
      <div className="mx-auto grid grid-cols-1 max-w-[1200px] items-center gap-10 px-5 pt-16 pb-8 md:min-h-[calc(100dvh-4rem)] md:grid-cols-[1.05fr_0.95fr] md:pt-20">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.p variants={item} className="eyebrow mb-3.5">
            <span aria-hidden="true">&gt;</span> file uploader online
          </motion.p>
          <motion.h1
            variants={item}
            className="m-0 max-w-[12ch] text-[clamp(34px,4.8vw,58px)] font-bold leading-[1.02] tracking-[-0.04em] text-ink"
          >
            Upload file, dapat link instan.
          </motion.h1>
          <motion.p
            variants={item}
            className="m-0 mt-3.5 max-w-[46ch] text-base leading-relaxed text-muted"
          >
            Gambar, video, audio, dan dokumen hingga 200MB. Link permanen siap dibagikan.
          </motion.p>
          <motion.div variants={item} className="mt-6 flex flex-wrap gap-3">
            <a href="#upload" className="btn btn-primary btn-lg">
              Upload File
            </a>
            <a href="#format" className="btn btn-ghost btn-lg">
              Lihat Format
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, x: 26 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
          className="min-w-0"
        >
          <DemoMiniUploader />
          <p className="m-0 mt-2.5 flex items-center gap-2 font-mono text-xs text-muted">
            <CheckCircle size={14} weight="bold" className="text-ok" aria-hidden="true" />
            Preview langsung dari tool upload di bawah.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
