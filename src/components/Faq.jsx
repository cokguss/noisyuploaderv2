import { CaretDown } from '@phosphor-icons/react';
import { useState } from 'react';
import { FAQS } from '../data';
import Reveal from './Reveal';

export default function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="mx-auto max-w-[820px] px-5 pt-16 pb-6">
      <Reveal>
        <h2 className="m-0 max-w-[22ch] text-[clamp(24px,3vw,34px)] font-bold tracking-[-0.03em] text-ink">
          Pertanyaan umum.
        </h2>
      </Reveal>

      <div className="mt-7 grid grid-cols-1 gap-3">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <Reveal key={f.q} delay={i * 0.04}>
              <div
                className={`card overflow-hidden p-0 transition-colors duration-200 ${isOpen ? 'border-accent/50' : ''}`}
              >
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-between gap-3 bg-transparent px-5 py-4 text-left text-[15px] font-semibold text-ink"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                >
                  {f.q}
                  <CaretDown
                    size={16}
                    weight="bold"
                    aria-hidden="true"
                    className={`flex-none text-accent transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  <div
                    className={`min-h-0 overflow-hidden transition-opacity duration-200 ${
                      isOpen ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <p className="m-0 px-5 pb-4 leading-relaxed text-muted">{f.a}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
