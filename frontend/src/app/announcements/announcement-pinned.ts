export function parseAnnouncementPinned(
  query: Record<string, string | string[] | undefined>,
): boolean | null {
  const keys = Object.keys(query);
  if (keys.length === 0) return false;
  if (keys.length !== 1 || keys[0] !== 'pinnedOnly' || query.pinnedOnly !== '1') return null;
  return true;
}
