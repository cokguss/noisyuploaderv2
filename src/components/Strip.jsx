import { Database, FileArchive, FileAudio, FileImage, FileVideo, LockOpen } from '@phosphor-icons/react';
import { useReducedMotion } from 'motion/react';

const ITEMS = [
  { icon: FileImage, label: 'Gambar' },
  { icon: FileVideo, label: 'Video' },
  { icon: FileAudio, label: 'Audio' },
  { icon: FileArchive, label: 'Dokumen' },
  { icon: Database, label: 'maks 200MB' },
  { icon: LockOpen, label: 'tanpa daftar' },
];

export default function Strip() {
  const reduce = useReducedMotion();
  const list = reduce ? ITEMS : [...ITEMS, ...ITEMS];

  return (
    <section aria-label="Format dan batas" className="overflow-hidden border-y border-line bg-panel/50">
      {reduce ? (
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5">
          {list.map((it, i) => (
            <span
              key={it.label + i}
              className="inline-flex items-center gap-2 font-mono text-[12.5px] text-muted"
            >
              <it.icon size={14} weight="bold" className="text-accent" aria-hidden="true" />
              {it.label}
              {i === list.length - 1 ? null : (
                <span aria-hidden="true" className="ml-3 font-mono text-[11px] text-muted/50">
                  |
                </span>
              )}
            </span>
          ))}
        </div>
      ) : (
        <div className="marquee-track py-3.5">
          {list.map((it, i) => (
            <span
              key={it.label + i}
              aria-hidden={i >= ITEMS.length}
              className="mr-8 inline-flex flex-none items-center gap-2 font-mono text-[12.5px] text-muted"
            >
              <it.icon size={14} weight="bold" className="text-accent" aria-hidden="true" />
              {it.label}
              <span aria-hidden="true" className="ml-3 font-mono text-[11px] text-muted/50">
                |
              </span>
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
