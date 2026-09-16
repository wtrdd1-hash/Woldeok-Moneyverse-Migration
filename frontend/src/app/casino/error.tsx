'use client';

import { useEffect } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CasinoError({
  error,
  reset,
}: {
  readonly error: Error & { readonly digest?: string };
  readonly reset: () => void;
}) {
  useEffect(() => {
    console.error('Captured casino page error:', error);
  }, [error]);

  return (
    <div className="mx-auto grid w-full max-w-2xl gap-4 py-10">
      <Card className="overflow-hidden border-amber-500/25 bg-gradient-to-b from-card to-amber-500/5">
        <CardHeader className="gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </div>
          <CardTitle>게임 화면을 다시 불러와 주세요</CardTitle>
          <CardDescription>
            Casino screen recovery · 이미 서버에 접수된 판은 멱등 처리되므로 같은 베팅을 연속 제출하지 말고,
            먼저 화면을 복구해 결과와 최근 기록을 확인하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="rounded-xl border bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
            화면 렌더링 오류가 정산 결과를 바꾸지는 않습니다. 다시 시도 후 최근 게임 기록과 지갑 잔액을 확인하면
            서버가 확정한 결과를 확인할 수 있습니다.
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={reset} className="min-h-11 gap-2 font-bold">
              <RefreshCw className="size-4" aria-hidden="true" />
              게임 화면 다시 시도
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => window.location.reload()}
            >
              전체 새로고침
            </Button>
          </div>
          {error.digest ? (
            <p className="text-xs tabular-nums text-muted-foreground">Reference / 참조 코드: {error.digest}</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
