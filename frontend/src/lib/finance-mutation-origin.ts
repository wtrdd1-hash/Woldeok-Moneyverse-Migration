/**
 * Next Request.url may contain the internal localhost upstream URL behind nginx.
 * Preserve strict same-origin CSRF while accepting the canonical external Host.
 * Never infer a permitted origin from an unbounded X-Forwarded-Host alone.
 */
const knownExternalHosts = new Set(['easy-scraping.com', 'test.easy-scraping.com']);

export function isSameOriginFinanceMutation(request: Request): boolean {
  const origin = request.headers.get('origin');
  const site = request.headers.get('sec-fetch-site');
  if (!origin || (site !== null && site !== 'same-origin')) return false;
  try {
    const publicOrigin = new URL(origin);
    if (publicOrigin.origin !== origin) return false;
    if (origin === new URL(request.url).origin) return true;

    // Reverse proxy: request.url is local, but the browser's HTTPS Origin must
    // match a verified production/test host instead of a forged arbitrary host.
    if (publicOrigin.protocol !== 'https:' || !knownExternalHosts.has(publicOrigin.host)) {
      return false;
    }
    const host = request.headers.get('host')?.toLowerCase();
    const forwardedHost = request.headers.get('x-forwarded-host')?.toLowerCase();
    return host === publicOrigin.host || forwardedHost === publicOrigin.host;
  } catch {
    return false;
  }
}
