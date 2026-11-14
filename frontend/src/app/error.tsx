'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PageError({
  error,
  reset,
}: {
  readonly error: Error & { readonly digest?: string };
  readonly reset: () => void;
}) {
  const [reloading, setReloading] = useState(true);

  useEffect(() => {
    console.error('Captured page error:', error);

    // Production Server Components often hide the original network error and
    // expose only a generic digest. Treat the first boundary hit as transient:
    // one automatic reload absorbs the short backend/frontend hand-over during
    // a deploy. A real application bug is not looped forever; the next hit in
    // the recovery window is shown to the visitor normally.
    const lastRecovery = Number(sessionStorage.getItem('wdmv_error_recovery_ts') || '0');
    const now = Date.now();
    if (now - lastRecovery > 30000) {
      sessionStorage.setItem('wdmv_error_recovery_ts', String(now));
      const timer = setTimeout(() => window.location.reload(), 800);
      return () => clearTimeout(timer);
    }

    setReloading(false);
  }, [error]);

  const handleForceReset = async () => {
    setReloading(true);
    try {
      await fetch('/api/auth/clear-session', { method: 'POST' });
      sessionStorage.clear();
      localStorage.clear();
      if ('caches' in window) {
        const names = await window.caches.keys();
        await Promise.all(names.map((n) => window.caches.delete(n)));
      }
    } catch {
      /* ignore */
    }
    window.location.href = '/?reset=1';
  };

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
            : '방금 새로운 서비스 기능이 배포되었거나 오래된 쿠키 세션으로 인해 일시적인 오류가 발생했을 수 있습니다. 새로고침 또는 쿠키 초기화를 누르시면 정상적으로 복구됩니다.'}
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
        <Button
          onClick={handleForceReset}
          variant="outline"
          className="min-h-11 font-bold inline-flex items-center gap-2 border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <RotateCcw className="size-4" />
          세션/쿠키 강제 초기화 후 복구
        </Button>
      </div>
      {error.digest && (
        <p className="tabular text-xs text-muted-foreground">참조 코드 {error.digest}</p>
      )}
    </div>
  );
}
