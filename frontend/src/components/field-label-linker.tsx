'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Ties an unnamed form control to the one label in its field group
 * (live audit 2026-11-25: 19 calculator pages rendered <Label> beside an
 * <Input> with no htmlFor/id). It only acts when the nearest ancestor holding
 * a label contains exactly one label and one control, so it never guesses.
 */
export function linkFieldLabels(root: ParentNode): void {
  const controls = root.querySelectorAll<HTMLElement>('input:not([type=hidden]):not([type=radio]):not([type=checkbox]), select, textarea');
  let n = 0;
  controls.forEach((control) => {
    const c = control as HTMLInputElement;
    if (c.labels?.length || c.hasAttribute('aria-label') || c.hasAttribute('aria-labelledby')) return;
    let group: HTMLElement | null = c.parentElement;
    for (let depth = 0; group && depth < 3; depth += 1, group = group.parentElement) {
      const labels = group.querySelectorAll('label, [data-slot="label"]');
      if (labels.length === 0) continue;
      const peers = group.querySelectorAll('input:not([type=hidden]):not([type=radio]):not([type=checkbox]), select, textarea');
      if (labels.length !== 1 || peers.length !== 1) return;
      const label = labels[0] as HTMLElement;
      if (!label.id) label.id = `mv-field-label-${Date.now().toString(36)}-${(n += 1)}`;
      c.setAttribute('aria-labelledby', label.id);
      return;
    }
  });
}

export function FieldLabelLinker() {
  const pathname = usePathname();
  useEffect(() => {
    const main = document.getElementById('main');
    if (!main) return;
    linkFieldLabels(main);
    let queued = false;
    const observer = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; linkFieldLabels(main); });
    });
    observer.observe(main, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname]);
  return null;
}
