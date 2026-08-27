import { cn } from '@/lib/cn';
import type { StatusState } from '@/lib/status';

/**
 * The small haloed dot beside a service state, carried across from the
 * original. Never the only signal — the label always sits next to it, so the
 * state survives colour blindness and a screen reader.
 */
const TONE: Readonly<Record<StatusState, string>> = {
  operational: 'bg-[#3ca369] shadow-[0_0_0_4px_rgb(60_163_105/0.12)]',
  degraded: 'bg-[#d19432] shadow-[0_0_0_4px_rgb(209_148_50/0.14)]',
  outage: 'bg-[#c95c55] shadow-[0_0_0_4px_rgb(201_92_85/0.14)]',
  maintenance: 'bg-[#6e7a86] shadow-[0_0_0_4px_rgb(110_122_134/0.14)]',
  unknown: 'bg-[#98a29b] shadow-[0_0_0_4px_rgb(152_162_155/0.14)]',
};

export function StatusDot({ state }: { readonly state: StatusState }) {
  return <span aria-hidden className={cn('inline-block size-2 rounded-full', TONE[state])} />;
}
