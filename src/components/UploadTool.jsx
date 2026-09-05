import {
  ArrowSquareOut,
  CheckCircle,
  CloudArrowUp,
  Copy,
  Link as LinkIcon,
  Repeat,
  Trash,
} from '@phosphor-icons/react';
import { motion, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { copyText, fmtSize, loadHist, pushHist, clearHist as clearHistStore, removeHist, uploadFile, validateFile } from '../lib/upload';
import FileIcon from './FileIcon';

const EASE = [0.23, 1, 0.32, 1];

export default function UploadTool() {
  const reduce = useReducedMotion();
  const inputRef = useRef(null);
  const resultRef = useRef(null);
  const copyTimer = useRef(null);
  const [file, setFile] = useState(null);
  const [err, setErr] = useState('');
  const [status, setStatus] = useState('Siap. Pilih file untuk mulai.');
  const [uploading, setUploading] = useState(false);
  const [pct, setPct] = useState(0);
  const [pLoaded, setPLoaded] = useState(0);
  const [pTotal, setPTotal] = useState(0);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [drag, setDrag] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [addedUrl, setAddedUrl] = useState(null);
  const [warn, setWarn] = useState(null);

  useEffect(() => {
    setHistory(loadHist());
  }, []);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  const selectFile = useCallback((f) => {
    setErr('');
    setWarn(null);
    if (!f) return;
    const v = validateFile(f);
    if (v) {
      setErr(v);
      return;
    }
    setFile(f);
    setPct(0);
    setStatus('File siap. Klik Upload File.');
  }, []);

  const pick = (e) => selectFile(e?.target?.files?.[0]);

  const doUpload = async () => {
    if (uploading) return;
    if (!file) {
      setErr('Pilih file dulu.');
      return;
    }
    setErr('');
    setWarn(null);
    setUploading(true);
    setResult(null);
    setPct(0);
    setPLoaded(0);
    setPTotal(file.size);
    setStatus('Mengupload ke Catbox…');

    const res = await uploadFile(file, (p) => {
      setPct(p.pct);
      setPLoaded(p.loaded);
      setPTotal(p.total);
    });

    setUploading(false);
    if (!res.ok) {
      setPct(0);
      setStatus('Gagal. Perbaiki error di atas lalu coba lagi.');
      setErr(res.message);
      return;
    }
    setPct(100);
    setResult({
      url: res.url,
      fileName: res.file?.fileName || file.name,
      size: res.file?.fileSizeFormatted || fmtSize(file.size),
      elapsedMs: res.elapsedMs,
    });
    setWarn(res.file?.remoteSize === 0 ? 'Link terbit, tapi file terdeteksi 0 byte di server Catbox. Upload ulang agar link valid.' : null);
    setStatus('Selesai. Klik Salin Link.');
    setAddedUrl(res.url);
    setHistory(pushHist(res.file?.fileName || file.name, res.url, res.file?.fileSizeFormatted || fmtSize(file.size)));
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 60);
  };

  const doCopy = async (text, msg, key = null) => {
    const ok = await copyText(text);
    setStatus(ok ? msg : 'Gagal menyalin otomatis. Salin manual: ' + text);
    if (ok) {
      setCopiedUrl(key);
      if (!key) setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => {
        setCopied(false);
        setCopiedUrl(null);
      }, 1500);
    }
  };

  const note = file ? file.name.split('.').pop().toUpperCase() : 'FILE';

  return (
    <section id="upload" className="mx-auto max-w-[1200px] px-5 pt-16 pb-6">
      <h2 className="m-0 max-w-[22ch] text-[clamp(24px,3vw,34px)] font-bold tracking-[-0.03em] text-ink">
        Upload file Anda sekarang.
      </h2>
      <p className="m-0 mt-2.5 max-w-[65ch] leading-relaxed text-muted">
        Seret file ke bawah, tunggu progress selesai, salin linknya.
      </p>

      <div className="mt-7 grid grid-cols-1 items-start gap-4 md:grid-cols-2">
        {/* kiri: dropzone + progress + aksi */}
        <div className="card min-w-0 p-5">
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload file"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              selectFile(e.dataTransfer?.files?.[0]);
            }}
            className={`dropzone flex min-h-[150px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-input border border-dashed border-line bg-bg/40 px-4 py-6 text-center hover:border-accent ${
              drag ? 'drop-drag' : ''
            }`}
          >
            <input ref={inputRef} type="file" className="hidden" onChange={pick} />
            {!file ? (
              <>
                <span className="grid h-13 w-13 place-items-center rounded-input bg-accent/15 text-accent">
                  <CloudArrowUp size={26} weight="bold" aria-hidden="true" />
                </span>
                <p className="m-0 text-[15px] font-semibold text-ink">
                  Seret file ke sini atau{' '}
                  <button type="button" className="link" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
                    pilih file
                  </button>
                </p>
                <p className="m-0 font-mono text-xs text-muted">gambar, video, audio, dokumen hingga 200MB</p>
              </>
            ) : (
              <div className="flex w-full items-center gap-3 text-left">
                <span className="grid h-11 w-11 flex-none place-items-center rounded-input bg-accent/15 text-accent">
                  <FileIcon name={file.name} type={file.type} size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="m-0 truncate text-sm font-semibold text-ink">{file.name}</p>
                  <p className="m-0 font-mono text-[11px] text-muted">
                    {fmtSize(file.size)} | {note}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm flex-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                >
                  <Repeat size={14} weight="bold" aria-hidden="true" /> Ganti
                </button>
              </div>
            )}
          </div>

          {uploading && (
            <div className="mt-3.5 grid grid-cols-1 gap-2">
              <div className="flex justify-between gap-2 font-mono text-xs text-muted">
                <span>Mengupload… {pct}%</span>
                <span>
                  {fmtSize(pLoaded)} / {fmtSize(pTotal)}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-btn border border-line bg-bg" aria-hidden="true">
                <div
                  className="h-full origin-left bg-accent transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]"
                  style={{ transform: 'scaleX(' + pct / 100 + ')' }}
                />
              </div>
            </div>
          )}

          <button type="button" className="btn btn-primary btn-lg btn-block" disabled={!file || uploading} onClick={doUpload}>
            <CloudArrowUp size={18} weight="bold" aria-hidden="true" /> Upload File
          </button>

          {err && (
            <motion.p
              key={err}
              role="alert"
              initial={reduce ? false : { opacity: 0, y: -6 }}
              animate={
                reduce
                  ? { opacity: 1, y: 0 }
                  : {
                      opacity: 1,
                      y: 0,
                      x: [0, -6, 6, -3, 3, 0],
                      transition: {
                        x: { duration: 0.45, delay: 0.12, ease: 'easeInOut' },
                        default: { duration: 0.2, ease: EASE },
                      },
                    }
              }
              className="m-0 mt-3 rounded-input border border-err/40 bg-err/10 p-2.5 font-mono text-[12.5px] text-err"
            >
              {err}
            </motion.p>
          )}
          <p className="m-0 mt-3 font-mono text-xs text-muted">
            <span className="text-accent" aria-hidden="true">&gt;</span> {status}
          </p>
        </div>

        {/* kanan: hasil + riwayat */}
        <div className="card min-w-0 p-5" ref={resultRef} aria-live="polite">
          {!result ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <span className="grid h-13 w-13 place-items-center rounded-input bg-accent/15 text-accent">
                <LinkIcon size={26} weight="bold" aria-hidden="true" />
              </span>
              <p className="m-0 text-[15px] font-semibold text-ink">Link muncul di sini</p>
              <p className="m-0 font-mono text-xs text-muted">plus tombol salin, buka, dan riwayat upload</p>
            </div>
          ) : (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <p className="m-0 mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">link file anda</p>
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.08, ease: EASE }}
                className="overflow-hidden rounded-input border border-line bg-bg p-3"
              >
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="block truncate font-mono text-[13px] text-accent no-underline hover:underline">
                  {result.url}
                </a>
              </motion.div>
              {warn && (
                <p className="m-0 mt-2.5 rounded-input border border-err/40 bg-err/10 p-2.5 font-mono text-[12px] text-err" role="alert">
                  {warn}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2.5">
                <button type="button" className="btn btn-primary btn-sm" onClick={() => doCopy(result.url, 'Link disalin. Bagikan ke siapa saja.')}>
                  <motion.span
                    key={copied ? 'ok' : 'copy'}
                    initial={reduce ? false : { opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.15, ease: EASE }}
                    className="inline-flex items-center gap-1.5"
                  >
                    {copied ? (
                      <>
                        <CheckCircle size={14} weight="bold" aria-hidden="true" />
                        Tersalin
                      </>
                    ) : (
                      <>
                        <Copy size={14} weight="bold" aria-hidden="true" />
                        Salin Link
                      </>
                    )}
                  </motion.span>
                </button>
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                  <ArrowSquareOut size={14} weight="bold" aria-hidden="true" /> Buka
                </a>
              </div>
              <p className="m-0 mt-3 truncate font-mono text-xs text-muted">
                {result.fileName} | {result.size} | {result.elapsedMs}ms
              </p>
            </motion.div>
          )}

          <div className="mt-5 border-t border-line pt-3.5">
            <div className="mb-2.5 flex items-center justify-between">
              <p className="m-0 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">riwayat perangkat ini</p>
              {history.length > 0 && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setHistory(clearHistStore())}>
                  <Trash size={13} weight="bold" aria-hidden="true" />
                  Hapus
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="m-0 font-mono text-xs text-muted">Belum ada upload.</p>
            ) : (
              <ul className="m-0 grid grid-cols-1 list-none gap-2 p-0">
                {history.map((it) => (
                  <motion.li
                    key={it.url}
                    initial={it.url === addedUrl && !reduce ? { opacity: 0, y: 8 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="flex items-center gap-2 rounded-input border border-line bg-bg p-1.5 pl-3"
                  >
                    <a href={it.url} target="_blank" rel="noopener noreferrer" className="flex min-w-0 flex-1 items-center gap-2 text-[13px] text-ink no-underline">
                      <FileIcon name={it.name} type="" size={16} />
                      <span className="min-w-0 flex-1 truncate">{it.name}</span>
                      <span className="flex-none font-mono text-[11px] text-muted">{it.size || ''}</span>
                    </a>
                    <button
                      type="button"
                      className="grid h-7 w-7 flex-none cursor-pointer place-items-center rounded-input border border-line bg-transparent text-ink transition-colors hover:border-accent hover:text-accent"
                      title="Salin link"
                      aria-label={'Salin link ' + it.name}
                      onClick={() => doCopy(it.url, 'Link riwayat disalin.', it.url)}
                    >
                      <motion.span
                        key={copiedUrl === it.url ? 'ok' : 'copy'}
                        initial={reduce ? false : { opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.15, ease: EASE }}
                        className="grid place-items-center"
                      >
                        {copiedUrl === it.url ? (
                          <CheckCircle size={13} weight="bold" className="text-ok" aria-hidden="true" />
                        ) : (
                          <Copy size={13} weight="bold" aria-hidden="true" />
                        )}
                      </motion.span>
                    </button>
                    <button
                      type="button"
                      className="grid h-7 w-7 flex-none cursor-pointer place-items-center rounded-input border border-line bg-transparent text-ink transition-colors hover:border-err hover:text-err"
                      title="Hapus dari riwayat"
                      aria-label={'Hapus ' + it.name + ' dari riwayat'}
                      onClick={() => setHistory(removeHist(it.url))}
                    >
                      <Trash size={13} weight="bold" aria-hidden="true" />
                    </button>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
