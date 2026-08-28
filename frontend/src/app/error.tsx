'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

/**
 * What a reader sees when a page throws on their side.
 *
 * Without this they get Next's own screen, which says "Application error: a
 * client-side exception has occurred" in English and offers nothing to do
 * about it. Most of the exceptions this catches are recoverable — a chunk
 * that went missing when a deploy replaced it under an open tab is the common
 * one — and for those, reloading is the fix.
 *
 * `digest` is the only handle on what actually happened: a production build
 * ships minified React errors, so the message is a number. Showing it means a
 * reader can quote it and it can be found in the logs.
 */
export default function PageError({
  error,
  reset,
}: {
  readonly error: Error & { readonly digest?: string };
  readonly reset: () => void;
}) {
  useEffect(() => {
    // Into the browser console, where a reader who opens it will find the
    // stack rather than only the digest.
    console.error('page error', error);
  }, [error]);

  return (
    <div className="grid gap-5 py-16" role="alert">
      <div className="grid gap-3">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="text-[clamp(1.75rem,3.5vw,2.5rem)]">화면을 그리지 못했어요.</h1>
        <p className="max-w-prose leading-[1.8] text-muted-foreground [word-break:keep-all]">
          잠시 후 다시 시도해 주세요. 방금 서비스가 업데이트됐다면 새로고침 한 번으로 해결되는
          경우가 많습니다.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={reset} className="min-h-11 font-extrabold">
          다시 시도
        </Button>
        <Button
          variant="outline"
          className="min-h-11"
          onClick={() => window.location.reload()}
        >
          새로고침
        </Button>
      </div>
      {error.digest && (
        <p className="tabular text-xs text-muted-foreground">오류 코드 {error.digest}</p>
      )}
    </div>
  );
}
