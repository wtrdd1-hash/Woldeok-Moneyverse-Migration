'use client';

import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

/**
 * A list that previews its first few rows and lets a member open the whole list.
 *
 * `rows` is an array of *rendered* rows rather than data plus a renderer,
 * because every screen that uses this fetches on the server: a render
 * function cannot cross the boundary into a client component, but a row that
 * has already been rendered can. So the page keeps its own row — a
 * `PostingStrip`, a receipt line — and this only decides where each one
 * lands. Nothing here fetches, and opening the dialog asks the server
 * nothing; the remainder was in the payload the page already sent.
 *
 * The dialog deliberately holds the whole list, including the rows from the
 * preview. The preview answers "what just happened?"; the dialog answers
 * "show me everything" without making a member mentally join two lists.
 */
export interface TruncatedListProps {
  /** Names the dialog, and gives the control its context in a screen reader. */
  readonly title: string;
  /** Already-rendered rows, in the order they should read. Each needs a key. */
  readonly rows: readonly ReactNode[];
  /** How many stay on the page. The rest go behind the control. */
  readonly visibleCount: number;
  /** Overrides the sentence under the dialog's title. */
  readonly description?: string;
  /** The caller's own row spacing, applied to both halves so they match. */
  readonly listClassName?: string;
}

export function TruncatedList({
  title,
  rows,
  visibleCount,
  description,
  listClassName,
}: TruncatedListProps) {
  const shown = Math.max(0, Math.min(visibleCount, rows.length));
  const hidden = rows.length - shown;

  return (
    <>
      <div className={listClassName}>{rows.slice(0, shown)}</div>

      {/* No remainder, no control. A button that opens an empty dialog is a
          promise the dialog cannot keep. */}
      {hidden > 0 && (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="mt-1 min-h-11 w-full border-t text-sm font-bold text-clay-ink"
            >
              {/* Two of these can sit on one screen. The title is in the
                  accessible name so they do not both announce as "더보기". */}
              <span className="sr-only">{title} </span>
              더보기
              <ChevronDown aria-hidden />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85dvh] grid-rows-[auto_minmax(0,1fr)] sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>
                {description ?? `전체 ${rows.length}개를 볼 수 있어요.`}
              </DialogDescription>
            </DialogHeader>
            {/* The rows scroll, the header stays, and the page behind does not
                move: `minmax(0, 1fr)` is what lets this box be shorter than
                its content, and Radix's modal locks the document while it is
                open. `overscroll-contain` stops the last wheel event here
                rather than handing it to whatever is underneath. */}
            <div className={cn('overflow-y-auto overscroll-contain', listClassName)}>
              {rows}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
