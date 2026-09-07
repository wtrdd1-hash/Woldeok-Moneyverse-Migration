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

  return (
    <html lang="ko">
      <body
        style={{
          background: '#f7f4ed',
          color: '#18231d',
          fontFamily: 'system-ui, sans-serif',
          margin: 0,
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          padding: '2rem',
        }}
      >
        <div style={{ display: 'grid', gap: '1rem', maxWidth: '34rem' }} role="alert">
          <h1 style={{ fontSize: '1.6rem', margin: 0 }}>{recovering ? '서비스 연결을 복구하고 있어요.' : '화면을 불러오지 못했어요.'}</h1>
          <p style={{ lineHeight: 1.8, margin: 0, wordBreak: 'keep-all' }}>
            {recovering
              ? '업데이트 전환을 감지해 자동으로 다시 연결하고 있습니다. 잠시만 기다려 주세요.'
              : '잠시 후 다시 시도해 주세요. 문제가 계속되면 새로고침으로 다시 연결할 수 있습니다.'}
          </p>
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
