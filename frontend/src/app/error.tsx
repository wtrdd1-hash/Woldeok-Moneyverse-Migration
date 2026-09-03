'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PageError({
  error,
  reset,
}: {
  readonly error: Error & { readonly digest?: string };
  readonly reset: () => void;
}) {
  const [reloading, setReloading] = useState(false);

  useEffect(() => {
    console.error('Captured page error:', error);

    const msg = (error.message || '').toLowerCase();
    const name = (error.name || '').toLowerCase();
    const isChunkOrDeployError =
      msg.includes('chunk') ||
      msg.includes('loading') ||
      msg.includes('failed to fetch') ||
      msg.includes('dynamically imported module') ||
      name.includes('chunk') ||
      (error.digest && error.digest.includes('NEXT_NOT_FOUND'));

    // 배포 갱신 또는 청크 불일치 감지 시 자동 새로고침 복구 (무한루프 방지 10초 세션)
    const lastReload = Number(sessionStorage.getItem('wdmv_chunk_reload_ts') || '0');
    const now = Date.now();

    if (isChunkOrDeployError && now - lastReload > 10000) {
      sessionStorage.setItem('wdmv_chunk_reload_ts', String(now));
      setReloading(true);
      const timer = setTimeout(() => {
        window.location.reload();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="grid gap-5 py-16 text-center sm:text-left" role="alert">
      <div className="grid gap-3">
        <p className="eyebrow flex items-center justify-center sm:justify-start gap-1.5 text-amber-500">
          <Sparkles className="size-3.5" />
          <span>{reloading ? 'System Update' : 'Something went wrong'}</span>
        </p>
        <h1 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-black tracking-tight">
          {reloading ? '새로운 버전을 불러오고 있어요.' : '화면을 불러오지 못했어요.'}
        </h1>
        <p className="max-w-prose leading-[1.8] text-muted-foreground [word-break:keep-all]">
          {reloading
            ? '최신 업데이트가 배포되어 화면을 자동으로 새로고침하고 있습니다. 잠시만 기다려 주세요...'
            : '방금 새로운 서비스 기능이 배포되었거나 일시적인 네트워크 지연이 발생했을 수 있습니다. 새로고침을 누르시면 정상적으로 표시됩니다.'}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
        <Button
          onClick={() => {
            setReloading(true);
            window.location.reload();
          }}
          className="min-h-11 font-extrabold inline-flex items-center gap-2 bg-amber-500 text-black hover:bg-amber-400"
        >
          <RefreshCw className={`size-4 ${reloading ? 'animate-spin' : ''}`} />
          {reloading ? '불러오는 중...' : '지금 새로고침'}
        </Button>
        <Button onClick={reset} variant="outline" className="min-h-11" disabled={reloading}>
          다시 시도
        </Button>
      </div>
      {error.digest && (
        <p className="tabular text-xs text-muted-foreground">참조 코드 {error.digest}</p>
      )}
    </div>
  );
}