/** Parse a member's search without silently accepting duplicate or unbounded input. */
export function parseMarketplaceSearch(value: unknown): { valid: true; query: string } | { valid: false; query: '' } {
  if (value === undefined) return { valid: true, query: '' };
  if (typeof value !== 'string') return { valid: false, query: '' };
  const query = value.trim();
  if (Array.from(query).length > 40 || /\p{Cc}/u.test(query)) return { valid: false, query: '' };
  return { valid: true, query };
}
