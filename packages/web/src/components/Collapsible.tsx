'use client';

import { useRef, useCallback } from 'react';

const DURATION = 250;

type CollapsibleProps = {
  title: string;
  children: React.ReactNode;
};

export default function Collapsible({ title, children }: CollapsibleProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animatingRef = useRef(false);

  const handleClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const details = detailsRef.current;
    const content = contentRef.current;
    if (!details || !content || animatingRef.current) return;

    animatingRef.current = true;

    function onceDone(fn: () => void) {
      let called = false;
      const run = () => {
        if (called) return;
        called = true;
        content!.removeEventListener('transitionend', run);
        fn();
      };
      content!.addEventListener('transitionend', run, { once: true });
      setTimeout(run, DURATION + 50);
    }

    if (details.open) {
      content.style.gridTemplateRows = '0fr';
      onceDone(() => {
        details.removeAttribute('open');
        content.style.gridTemplateRows = '';
        animatingRef.current = false;
      });
    } else {
      details.setAttribute('open', '');
      content.style.gridTemplateRows = '0fr';
      content.getBoundingClientRect();
      content.style.gridTemplateRows = '1fr';
      onceDone(() => {
        content.style.gridTemplateRows = '';
        animatingRef.current = false;
      });
    }
  }, []);

  return (
    <details
      ref={detailsRef}
      className="group rounded-xl border border-border bg-bg-surface/60 transition-all hover:border-border-bright"
    >
      <summary
        onClick={handleClick}
        className="cursor-pointer list-none px-6 py-4 font-mono text-sm font-medium text-text transition-colors group-open:text-accent [&::-webkit-details-marker]:hidden"
      >
        <span className="mr-3 inline-block font-mono text-accent transition-transform group-open:rotate-90">
          &gt;
        </span>
        {title}
      </summary>
      <div ref={contentRef} className="details-content">
        <div>
          <div className="px-6 pb-5 pl-12 text-sm leading-relaxed text-text-muted">{children}</div>
        </div>
      </div>
    </details>
  );
}
