'use client';

import { useEffect, useState } from 'react';

/**
 * The last resort: a throw in the root layout itself, where the masthead and
 * the stylesheet may not exist yet.
 *
 * It has to render its own <html> and <body> because it replaces the root
 * layout rather than sitting inside it, and it cannot rely on the design
 * tokens for the same reason — everything here is inline.
 */
export default function GlobalError({
  error,
  reset,
}: {
  readonly error: Error & { readonly digest?: string };
  readonly reset: () => void;
}) {
  const [recovering, setRecovering] = useState(true);

  useEffect(() => {
    console.error('Captured global error:', error);
    const lastRecovery = Number(sessionStorage.getItem('wdmv_global_recovery_ts') || '0');
    const now = Date.now();
    if (now - lastRecovery > 30000) {
      sessionStorage.setItem('wdmv_global_recovery_ts', String(now));
      const timer = setTimeout(() => window.location.reload(), 800);
      return () => clearTimeout(timer);
    }
    setRecovering(false);
  }, [error]);

  const handleForceReset = async () => {
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
    <html lang="ko">
      <body
        style={{
          background: '#090d16',
          color: '#f9fafb',
          fontFamily: 'system-ui, sans-serif',
          margin: 0,
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          padding: '2rem',
        }}
      >
        <div style={{ display: 'grid', gap: '1rem', maxWidth: '34rem' }} role="alert">
          <h1 style={{ fontSize: '1.6rem', margin: 0, color: '#f59e0b' }}>
            {recovering ? '서비스 연결을 복구하고 있어요.' : '화면을 불러오지 못했어요.'}
          </h1>
          <p style={{ lineHeight: 1.8, margin: 0, wordBreak: 'keep-all', color: '#9ca3af' }}>
            {recovering
              ? '업데이트 전환을 감지해 자동으로 다시 연결하고 있습니다. 잠시만 기다려 주세요.'
              : '잠시 후 다시 시도해 주세요. 버전 변경이나 오래된 세션으로 인한 오류인 경우 아래 세션 초기화 버튼으로 즉시 해결할 수 있습니다.'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={reset}
              disabled={recovering}
              style={{
                background: '#214b38',
                border: 0,
                borderRadius: '12px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 800,
                minHeight: '44px',
                padding: '0 1.25rem',
                width: 'fit-content',
              }}
            >
              {recovering ? '연결 중...' : '다시 시도'}
            </button>
            <button
              type="button"
              onClick={handleForceReset}
              style={{
                background: '#7f1d1d',
                border: '1px solid #ef4444',
                borderRadius: '12px',
                color: '#fca5a5',
                cursor: 'pointer',
                fontWeight: 800,
                minHeight: '44px',
                padding: '0 1.25rem',
                width: 'fit-content',
              }}
            >
              세션 및 쿠키 강제 초기화 후 재접속
            </button>
          </div>
          {error.digest && (
            <p style={{ fontSize: '0.75rem', margin: 0, opacity: 0.7 }}>
              오류 코드 {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
