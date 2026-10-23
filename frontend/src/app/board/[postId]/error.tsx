'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function BoardPostError({ reset }: { readonly error: Error; readonly reset: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);

  return (
    <section className="mv-page mx-auto w-full max-w-2xl px-4 py-8 sm:py-12" aria-labelledby="board-error-title">
      <Card>
        <CardContent className="grid gap-4 py-6">
          <h1 id="board-error-title" ref={heading} tabIndex={-1} className="text-xl font-bold focus:outline-none">
            게시글을 지금 불러올 수 없어요.
          </h1>
          <p role="alert" className="text-sm text-muted-foreground">
            일시적인 연결 문제일 수 있어요. 잠시 후 다시 시도해 주세요.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={reset}>다시 시도</Button>
            <Button asChild variant="outline"><Link href="/board">게시판 목록으로</Link></Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
