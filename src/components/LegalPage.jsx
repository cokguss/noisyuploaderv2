import { ArrowLeft } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import Reveal from './Reveal';

export default function LegalPage({ icon, eyebrow, title, lead, sections }) {
  return (
    <div className="mx-auto max-w-[820px] px-5 pt-10 pb-10 sm:pt-14">
      <Link to="/" className="btn btn-ghost btn-sm mb-8">
        <ArrowLeft size={14} weight="bold" aria-hidden="true" />
        Kembali ke beranda
      </Link>

      <Reveal>
        <span className="mb-4 grid h-12 w-12 place-items-center rounded-input bg-accent/15 text-accent">
          {icon}
        </span>
        <p className="eyebrow mb-2.5">{eyebrow}</p>
        <h1 className="m-0 text-[clamp(30px,4.5vw,46px)] font-bold leading-[1.05] tracking-[-0.04em] text-ink">
          {title}
        </h1>
        <p className="m-0 mt-4 max-w-[62ch] leading-relaxed text-muted">{lead}</p>
      </Reveal>

      <Reveal className="card mt-8 p-5 sm:p-8">
        <div className="divide-y divide-line">
          {sections.map((s, i) => (
            <Reveal key={s.h} delay={i * 0.05} className="py-5 first:pt-0 last:pb-0">
              <h2 className="m-0 text-[17px] font-semibold tracking-[-0.01em] text-ink">
                {s.h}
              </h2>
              <p className="m-0 mt-2 max-w-[65ch] leading-[1.7] text-muted">{s.p}</p>
            </Reveal>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
