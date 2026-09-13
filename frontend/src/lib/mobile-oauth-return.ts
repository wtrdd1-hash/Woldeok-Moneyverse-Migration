import { NextResponse } from 'next/server';

function mobileOAuthReturnUrl(code: string, provider: string): URL {
  const configured = process.env.MOBILE_OAUTH_RETURN_URI ?? 'woldeok-moneyverse://oauth/callback';
  const url = new URL(configured);
  url.searchParams.set('code', code);
  url.searchParams.set('provider', provider);
  return url;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/**
 * OAuth providers return through an HTTPS browser context. Some Android browser/custom-tab
 * combinations refuse an HTTP 302 directly to a custom URI scheme. Returning a tiny,
 * non-cacheable completion document lets the browser attempt the app navigation itself and
 * leaves an explicit user-gesture fallback when automatic external-app navigation is blocked.
 */
export function mobileOAuthCompletionResponse(code: string, provider: string): NextResponse {
  const destination = mobileOAuthReturnUrl(code, provider).toString();
  const scriptTarget = JSON.stringify(destination).replaceAll('<', '\\u003c');
  const htmlTarget = escapeHtml(destination);
  const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="robots" content="noindex,nofollow,noarchive" />
<title>월덕 머니버스로 돌아가기</title>
<style>body{font-family:system-ui,sans-serif;margin:0;padding:32px;background:#fff;color:#111}main{max-width:520px;margin:12vh auto}a{display:inline-block;margin-top:16px;padding:12px 18px;border:1px solid #222;border-radius:10px;color:#111;text-decoration:none;font-weight:700}p{line-height:1.6;color:#444}</style>
</head>
<body>
<main>
<h1>로그인이 완료되었습니다</h1>
<p>앱으로 돌아가는 중입니다. 자동으로 열리지 않으면 아래 버튼을 눌러 주세요.</p>
<a id="open-app" href="${htmlTarget}" rel="external">월덕 머니버스 앱 열기</a>
</main>
<script>window.location.replace(${scriptTarget});</script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store, max-age=0',
      'x-robots-tag': 'noindex, nofollow, noarchive',
      'content-security-policy':
        "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
    },
  });
}
