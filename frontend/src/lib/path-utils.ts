/**
 * Normalizes a URL pathname for security and consistent matching:
 * 1. Decodes URI components to prevent bypass via percent-encoding (e.g. %2f, %2e)
 * 2. Converts to lowercase for case-insensitive path comparisons
 * 3. Collapses consecutive slashes (e.g. //terms -> /terms)
 * 4. Strips trailing slashes (except root '/')
 * 5. Resolves relative traversal segments (e.g. /terms/../privacy -> /privacy)
 */
export function normalizePath(pathname: string): string {
  if (!pathname) return '/';

  let decoded = pathname;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    // Keep raw if malformed
  }

  // Lowercase & collapse duplicate slashes
  let normalized = decoded.toLowerCase().replace(/\/+/g, '/');

  // Resolve directory traversals safely
  const segments = normalized.split('/');
  const resolved: string[] = [];

  for (const segment of segments) {
    if (segment === '' || segment === '.') continue;
    if (segment === '..') {
      resolved.pop();
    } else {
      resolved.push(segment);
    }
  }

  normalized = '/' + resolved.join('/');

  return normalized || '/';
}
