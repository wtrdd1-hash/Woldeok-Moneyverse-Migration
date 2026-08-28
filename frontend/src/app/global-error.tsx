'use client';

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
          <h1 style={{ fontSize: '1.6rem', margin: 0 }}>화면을 불러오지 못했어요.</h1>
          <p style={{ lineHeight: 1.8, margin: 0, wordBreak: 'keep-all' }}>
            잠시 후 다시 시도해 주세요. 방금 서비스가 업데이트됐다면 새로고침 한 번으로
            해결되는 경우가 많습니다.
          </p>
          <button
            type="button"
            onClick={reset}
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
            다시 시도
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
