const APP_API_GROUPS = new Set([
  'account', 'activity', 'auth', 'bank', 'banking', 'board', 'businesses',
  'casino', 'content', 'early-game', 'engagement', 'media', 'photos', 'privacy',
  'profile', 'progression', 'rewards', 'seasons', 'shop', 'stocks', 'wallet', 'work',
]);

export function appGatewayPath(parts: readonly string[]): string | null {
  if (parts.length === 0) return null;
  const clean = parts.map((part) => part.trim());
  if (clean.some((part) => !part || part === '.' || part === '..' || part.includes('/'))) return null;
  if (!APP_API_GROUPS.has(clean[0]!)) return null;
  return `/api/v1/${clean.map(encodeURIComponent).join('/')}`;
}

export function appGatewayOrigin(headers: Headers): string | null {
  const host = headers.get('x-forwarded-host') ?? headers.get('host');
  if (!host || /[\r\n]/.test(host)) return null;
  const proto = headers.get('x-forwarded-proto') === 'http' ? 'http' : 'https';
  return `${proto}://${host}`;
}
