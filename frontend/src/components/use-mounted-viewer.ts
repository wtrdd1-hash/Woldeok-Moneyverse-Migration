'use client';

import { useEffect, useState } from 'react';
import { useViewer } from '@/lib/use-viewer';
import type { Viewer } from '@/lib/viewer-state';

/**
 * The viewer, but only after mount.
 *
 * Server HTML is always rendered signed-out (pages stay static; see AGENTS.md
 * §6). Reading a cached viewer during the first client render made the shell
 * differ from that HTML, which React reports as hydration error #418. Waiting
 * one effect keeps the first client render identical to the server's.
 */
export function useMountedViewer(): Viewer | null {
  const viewer = useViewer();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? viewer : null;
}
