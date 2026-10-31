// Android must never interpret a malformed 200 as verified ranking evidence.
// SQL casts WLD-independent score totals and entry counts to exact decimal strings.
export function verifiedSeasonLeaderboard(payload: unknown, limit: 3 | 10 | 20): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const rows = (payload as { entries?: unknown }).entries;
  if (!Array.isArray(rows) || rows.length > limit) return false;
  for (const [index, row] of rows.entries()) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
    const entry = row as Record<string, unknown>;
    if (entry.rank !== index + 1 ||
        typeof entry.points !== 'string' || !/^(0|[1-9]\d*)$/.test(entry.points) ||
        typeof entry.entries !== 'string' || !/^[1-9]\d*$/.test(entry.entries) ||
        typeof entry.display_name !== 'string' || !entry.display_name.trim() ||
        entry.display_name.length > 256) return false;
  }
  return true;
}
