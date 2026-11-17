'use client';

import { useEffect, useState } from 'react';
import { Home, RefreshCw, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logScreenLoadError, type ScreenLoadErrorRecord } from '@/lib/client-error-logger';

export default function PageError({
  error,
  reset,
}: {
  readonly error: Error & { readonly digest?: string };
  readonly reset: () => void;
}) {
  const [countdown, setCountdown] = useState(3);
  const [errorRecord, setErrorRecord] = useState<ScreenLoadErrorRecord | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // 1. Capture and permanently record error details
    const record = logScreenLoadError(error, 'PAGE_ERROR');
    setErrorRecord(record);

    // 2. Automated countdown for safe redirect to Home
    // Check if we are already on home to prevent redirect loops
    const isAlreadyHome = window.location.pathname === '/' || window.location.pathname === '';
    if (isAlreadyHome) {
      return; // Do not auto-loop if error happened on home itself
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [error]);

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:text-left" role="alert">
      <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex items-center justify-center sm:justify-start gap-2 text-amber-400 font-semibold mb-3">
          <AlertTriangle className="size-5" />
          <span className="text-sm tracking-wide">화면 로드 예외 감지</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-3">
          화면을 정상적으로 불러오지 못했어요.
        </h1>

        <p className="text-muted-foreground leading-relaxed mb-6 text-sm sm:text-base [word-break:keep-all]">
          요청하신 페이지를 렌더링하는 중 예외가 발생했습니다. 원인 및 시스템 로그는 안전하게 기록되었으며,{' '}
          <strong className="text-amber-400 font-bold">{countdown}초 후 홈으로 자동 이동</strong>합니다.
        </p>

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
          <Button
            onClick={handleGoHome}
            className="min-h-11 font-extrabold inline-flex items-center gap-2 bg-amber-500 text-black hover:bg-amber-400"
          >
            <Home className="size-4" />
            홈으로 즉시 이동 ({countdown}s)
          </Button>
          <Button
            onClick={reset}
            variant="outline"
            className="min-h-11 font-bold inline-flex items-center gap-2 border-white/20 hover:bg-white/10"
          >
            <RefreshCw className="size-4" />
            다시 시도
          </Button>
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="ghost"
            className="min-h-11 text-xs text-muted-foreground hover:text-white"
          >
            {showDetails ? (
              <>
                <ChevronUp className="size-4 mr-1" />
                오류 상세 접기
              </>
            ) : (
              <>
                <ChevronDown className="size-4 mr-1" />
                오류 상세 원인 보기
              </>
            )}
          </Button>
        </div>

        {showDetails && errorRecord && (
          <div className="mt-6 rounded-lg bg-black/60 p-4 text-left border border-white/10 text-xs font-mono">
            <div className="text-amber-400 font-bold mb-1">기록 ID: {errorRecord.id}</div>
            <div className="text-muted-foreground mb-1">발생 시간: {errorRecord.timestampKst}</div>
            <div className="text-muted-foreground mb-1">발생 경로: {errorRecord.path}</div>
            <div className="text-red-400 font-bold mb-2">오류 내용: {errorRecord.errorMessage}</div>
            {errorRecord.digest && (
              <div className="text-yellow-400 mb-2">참조 코드 (Digest): {errorRecord.digest}</div>
            )}
            {errorRecord.errorStack && (
              <pre className="max-h-48 overflow-y-auto rounded bg-black/80 p-2 text-[11px] text-gray-300 leading-tight">
                {errorRecord.errorStack}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
