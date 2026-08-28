'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useViewer } from '@/lib/use-viewer';

/**
 * The hero's pair of buttons, which say something different once the reader
 * has a session.
 *
 * The signed-out pair is what renders on the server, so it is what a crawler
 * and a first-time visitor receive in the prerendered HTML — the common case
 * for a landing page, and the one that must not flicker. A signed-in member
 * sees it swap once, shortly after hydration, which is the price of keeping
 * this page static; asking during render would opt it out of prerendering
 * for everybody.
 */
export function HomeCta() {
  const viewer = useViewer();
  const signedIn = viewer?.signedIn === true;

  // Full width while they are stacked: two buttons of different widths under
  // one another read as an accident rather than as a pair.
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <Button
        asChild
        className="h-12 w-full rounded-[12px] px-5 text-sm font-extrabold shadow-plate sm:w-auto"
      >
        {signedIn ? (
          <Link href="/wallet">
            내 지갑 열기
            <ArrowRight />
          </Link>
        ) : (
          <Link href="/login">
            Discord · Google로 시작하기
            <ArrowRight />
          </Link>
        )}
      </Button>
      <Button
        asChild
        variant="outline"
        className="h-12 w-full rounded-[12px] bg-surface/50 px-5 text-sm font-extrabold sm:w-auto"
      >
        <Link href="/announcements">
          알아보기
          <ArrowRight />
        </Link>
      </Button>
    </div>
  );
}
