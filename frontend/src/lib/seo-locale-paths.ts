import { isLocale } from './locale';

/**
 * Collapse obsolete locale-on-locale routes. The innermost/last explicit
 * prefix names the actual language of a physically localized page.
 * Never rewrite arbitrary URL segments or internal API paths.
 */
export function normalizeDoubleLocalePath(pathname: string): string | null {
  if (!pathname.startsWith('/')) return null;
  const parts = pathname.split('/');
  let index = 1;
  while (index < parts.length && isLocale(parts[index])) index++;
  if (index < 3) return null;
  const locale = parts[index - 1];
  const suffix = parts.slice(index).join('/');
  return '/' + locale + (suffix ? '/' + suffix : '');
}
