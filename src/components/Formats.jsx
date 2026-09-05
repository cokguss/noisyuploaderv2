import { FORMATS } from '../data';
import { createElement } from 'react';
import {
  FileArchive,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
} from '@phosphor-icons/react';
import Reveal from './Reveal';

const ICONS = {
  'ph-file-image': FileImage,
  'ph-file-video': FileVideo,
  'ph-file-audio': FileAudio,
  'ph-file-text': FileText,
  'ph-file-archive': FileArchive,
};

export default function Formats() {
  return (
    <section id="format" className="mx-auto max-w-[1200px] px-5 pt-16 pb-6">
      <Reveal>
        <h2 className="m-0 max-w-[22ch] text-[clamp(24px,3vw,34px)] font-bold tracking-[-0.03em] text-ink">
          Format yang didukung.
        </h2>
        <p className="m-0 mt-2.5 max-w-[65ch] leading-relaxed text-muted">
          File executable (.exe, .bat, .msi, dan sejenisnya) diblokir demi keamanan.
        </p>
      </Reveal>

      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-6">
        {FORMATS.map((f, i) => {
          const Icon = ICONS[f.icon] || FileText;
          const span = f.big ? 'md:col-span-4' : 'md:col-span-2';
          const variant = f.big
            ? 'border-accent/40 bg-accent/10'
            : f.tint
              ? 'bg-panel2'
              : '';
          return (
            <Reveal key={f.name} delay={i * 0.05} className={`${span} ${i === 4 ? 'sm:col-span-2 md:col-span-2' : ''}`}>
              <div className={`card card-hover flex h-full flex-col gap-2.5 p-5 ${variant}`}>
                <span className="icon-nudge inline-block text-accent">
                  {createElement(Icon, { size: f.big ? 26 : 20, weight: 'bold', 'aria-hidden': true })}
                </span>
                <h3 className="m-0 text-base font-semibold text-ink">{f.name}</h3>
                <p className="m-0 font-mono text-xs leading-relaxed text-muted">{f.ext}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
