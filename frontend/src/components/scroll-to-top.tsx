'use client';

import { useEffect, useRef } from 'react';

/**
 * Puts a newly navigated page at its own top.
 *
 * `redirect()` from a Server Action is a client navigation, and the App
 * Router does not always reset the scroll position for one — so arriving at
 * the provider picker from the bottom of a long consent panel left the reader
 * looking at the footer, with the Discord button above the fold and no reason
 * to suspect it was there. Reloading would fix it and would also throw away
 * everything client-side navigation is for.
 *
 * Focus moves with the scroll rather than instead of it. A reader using a
 * screen reader gets no announcement from a scroll, so the heading is given
 * focus and read out; `tabIndex={-1}` makes it focusable without adding it to
 * the tab order, and the outline is suppressed because this focus was not
 * asked for by a keypress.
 *
 * Runs once per mount, never on a re-render: a component that scrolled to the
 * top whenever its parent re-rendered would fight the reader for control of
 * the page.
 */
export function ScrollToTop({ children }: { readonly children: React.ReactNode }) {
  const anchor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // `instant`, not `smooth`: the page has already changed underneath the
    // reader, and animating to the top of new content reads as a glitch
    // rather than as a transition. It also respects a prefers-reduced-motion
    // setting by never animating at all.
    window.scrollTo({ top: 0, behavior: 'instant' });
    anchor.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div ref={anchor} tabIndex={-1} className="outline-none">
      {children}
    </div>
  );
}
