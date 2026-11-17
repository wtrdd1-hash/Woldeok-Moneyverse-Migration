'use client';

import { useEffect, useState } from 'react';
import { logScreenLoadError, type ScreenLoadErrorRecord } from '@/lib/client-error-logger';

export default function GlobalError({
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
    // 1. Capture and permanently record global error details
    const record = logScreenLoadError(error, 'GLOBAL_ROOT_ERROR');
    setErrorRecord(record);

    // 2. Automated countdown for safe redirect to Home
    const isAlreadyHome = typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '');
    if (isAlreadyHome) {
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [error]);

  const handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <html lang="ko">
      <body
        style={{
          background: '#090d16',
          color: '#f9fafb',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          margin: 0,
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          padding: '2rem',
        }}
      >
        <div
          style={{
            display: 'grid',
            gap: '1rem',
            maxWidth: '38rem',
            width: '100%',
            background: 'rgba(20, 27, 45, 0.7)',
            padding: '2rem',
            borderRadius: '16px',
            border: '1px solid rgba(245, 158, 11, 0.3)',
          }}
          role="alert"
        >
          <div style={{ color: '#f59e0b', fontSize: '0.875rem', fontWeight: 700 }}>
            ⚠️ 시스템 루트 예외 감지
          </div>
          <h1 style={{ fontSize: '1.75rem', margin: 0, fontWeight: 900, color: '#ffffff' }}>
            화면을 정상적으로 불러오지 못했어요.
          </h1>
          <p style={{ lineHeight: 1.8, margin: 0, wordBreak: 'keep-all', color: '#9ca3af', fontSize: '0.95rem' }}>
            애플리케이션 전역 렌더링 중 오류가 발생했습니다. 원인 및 시스템 진단 정보는 안전하게 기록되었으며,{' '}
            <strong style={{ color: '#f59e0b' }}>{countdown}초 후 홈으로 자동 이동</strong>합니다.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={handleGoHome}
              style={{
                background: '#f59e0b',
                border: 0,
                borderRadius: '10px',
                color: '#000',
                cursor: 'pointer',
                fontWeight: 800,
                minHeight: '44px',
                padding: '0 1.25rem',
              }}
            >
              홈으로 즉시 이동 ({countdown}s)
            </button>
            <button
              type="button"
              onClick={reset}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 700,
                minHeight: '44px',
                padding: '0 1.25rem',
              }}
            >
              다시 시도
            </button>
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              style={{
                background: 'transparent',
                border: 0,
                color: '#9ca3af',
                cursor: 'pointer',
                fontSize: '0.8rem',
                padding: '0 0.5rem',
              }}
            >
              {showDetails ? '오류 상세 접기 ▲' : '오류 상세 원인 보기 ▼'}
            </button>
          </div>

          {showDetails && errorRecord && (
            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                background: 'rgba(0, 0, 0, 0.8)',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                overflowX: 'auto',
              }}
            >
              <div style={{ color: '#f59e0b', fontWeight: 'bold' }}>기록 ID: {errorRecord.id}</div>
              <div style={{ color: '#9ca3af' }}>시간: {errorRecord.timestampKst}</div>
              <div style={{ color: '#9ca3af' }}>경로: {errorRecord.path}</div>
              <div style={{ color: '#ef4444', fontWeight: 'bold', margin: '0.5rem 0' }}>
                오류: {errorRecord.errorMessage}
              </div>
              {errorRecord.digest && (
                <div style={{ color: '#fbbf24' }}>참조 코드 (Digest): {errorRecord.digest}</div>
              )}
              {errorRecord.errorStack && (
                <pre style={{ margin: 0, color: '#d1d5db', whiteSpace: 'pre-wrap', maxHeight: '160px', overflowY: 'auto' }}>
                  {errorRecord.errorStack}
                </pre>
              )}
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
