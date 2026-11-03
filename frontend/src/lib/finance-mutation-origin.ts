/**
 * Internal Next request URLs may be loopback HTTP behind the public HTTPS
 * reverse proxy. Accept the canonical browser Origin only when its Host is
 * also a recognized public deployment host and the actual proxy URL is local.
 *
 * This is one defense in depth boundary; Nest still authenticates, binds the
 * actor to the session and verifies one-use CSRF and canonical settlement.
 */
const canonicalHosts = new Set(['easy-scraping.com', 'test.easy-scraping.com']);
const localNames = new Set(['127.0.0.1', 'localhost', '[::1]']);

export function isSameOriginFinanceMutation(request: Request): boolean {
  const originHeader = request.headers.get('origin');
  const site = request.headers.get('sec-fetch-site');
  if (!originHeader || (site !== null && site !== 'same-origin')) return false;
  try {
    const origin = new URL(originHeader);
    if (origin.origin !== originHeader || origin.username || origin.password) return false;
    const internal = new URL(request.url);
    // Existing direct origin requests (including current source unit tests).
    if (internal.origin === origin.origin) return true;

    // No trust in arbitrary X-Forwarded-Host; require public Host from Nginx.
    if (internal.protocol !== 'http:' || !localNames.has(internal.hostname)) return false;
    if (origin.protocol !== 'https:' || !canonicalHosts.has(origin.host)) return false;
    const host = request.headers.get('host')?.trim().toLowerCase();
    const forwarded = request.headers.get('x-forwarded-host')?.trim().toLowerCase();
    if (host !== origin.host) return false;
    if (forwarded !== undefined && forwarded !== origin.host) return false;
    return true;
  } catch {
    return false;
  }
}
