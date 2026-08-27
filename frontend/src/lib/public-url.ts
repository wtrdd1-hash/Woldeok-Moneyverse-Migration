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
