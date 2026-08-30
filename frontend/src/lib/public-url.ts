import 'server-only';

/**
 * The origin this application is reached at.
 *
 * Never derived from the incoming request. Behind the edge proxy `request.url`
 * carries the address the container was called on — `http://0.0.0.0:3000` —
 * and a redirect built from it sends the browser to a host that does not
 * exist outside the compose network. That is what happened to every OAuth
 * sign-in: the round trip completed, the session cookie was set, and the
 * browser was then pointed at nothing.
 *
 * Trusting `X-Forwarded-Host` instead would move the decision to a header a
 * caller can set. This value is configuration, and it is the same value the
 * API checks the OAuth redirect URIs against.
 */
export function publicUrl(path: string): string {
  const base = process.env.APP_BASE_URL;
  if (!base) throw new Error('APP_BASE_URL is not configured');
  return new URL(path, base).toString();
}

/**
 * Every origin this deployment answers on, the canonical one first.
 *
 * The same list the API parses from OAUTH_ALLOWED_REDIRECT_URIS. Both
 * processes read the environment rather than one asking the other, because a
 * redirect that has to make a network call to decide where to go is a redirect
 * that fails when the call does.
 */
function allowedOrigins(): readonly string[] {
  const base = process.env.APP_BASE_URL;
  if (!base) throw new Error('APP_BASE_URL is not configured');
  const origins = [new URL(base).origin];
  for (const entry of String(process.env.OAUTH_ALLOWED_REDIRECT_URIS ?? '').split(',')) {
    const trimmed = entry.trim();
    if (!trimmed) continue;
    try {
      const { origin } = new URL(trimmed);
      if (!origins.includes(origin)) origins.push(origin);
    } catch {
      // A malformed entry is dropped here rather than thrown, because this
      // runs while rendering a page. The API parses the same variable at boot
      // and refuses to start on a bad entry, which is where the operator is
      // told.
    }
  }
  return origins;
}

/**
 * The origin to send this visitor back to, chosen from the registered list.
 *
 * `publicUrl` remains the answer whenever the request's host is not one this
 * deployment claims -- an unrecognised Host cannot become a redirect target,
 * which is the property the comment above is protecting. What changes is that
 * a deployment reached at a second registered name now keeps the visitor
 * there, instead of moving them to the canonical origin mid-sign-in and losing
 * the host-only session cookie in the process.
 */
export function publicUrlForHost(path: string, requestHost: string | null): string {
  if (!requestHost) return publicUrl(path);
  const candidate = allowedOrigins().find((origin) => new URL(origin).host === requestHost);
  return candidate ? new URL(path, candidate).toString() : publicUrl(path);
}
