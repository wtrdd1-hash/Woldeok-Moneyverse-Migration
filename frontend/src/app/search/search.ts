import type { NavEntry } from '@/lib/navigation';
import { navLabel } from '@/lib/navigation';

export interface SearchEntry extends NavEntry {
  readonly access: 'public' | 'member' | 'admin';
}

export function searchableEntries(
  publicEntries: readonly NavEntry[],
  memberEntries: readonly NavEntry[],
  adminEntries: readonly NavEntry[],
  signedIn: boolean,
  administrator: boolean,
): readonly SearchEntry[] {
  const seen = new Set<string>();
  const result: SearchEntry[] = [];
  const append = (entries: readonly NavEntry[], access: SearchEntry['access']) => {
    for (const entry of entries) {
      if (seen.has(entry.href)) continue;
      seen.add(entry.href);
      result.push({ ...entry, access });
    }
  };
  append(publicEntries, 'public');
  if (signedIn) append(memberEntries, 'member');
  if (signedIn && administrator) append(adminEntries, 'admin');
  return result;
}

export function filterSearchEntries(
  entries: readonly SearchEntry[],
  query: string,
): readonly SearchEntry[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return [];
  return entries.filter((entry) => {
    const labels = `${entry.label} ${navLabel(entry.label, 'en')} ${entry.href}`.toLocaleLowerCase();
    return labels.includes(normalized);
  });
}
