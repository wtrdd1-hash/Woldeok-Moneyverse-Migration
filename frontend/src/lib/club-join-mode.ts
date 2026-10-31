/** Member club directory filter: only canonical stored join modes. */
export type ClubJoinMode = 'all' | 'public' | 'invite' | 'request';
export function parseClubJoinMode(raw: unknown): ClubJoinMode | null {
  if (raw === undefined) return 'all';
  return raw === 'all' || raw === 'public' || raw === 'invite' || raw === 'request' ? raw : null;
}

/** The Android gateway and server-rendered directory must never trust a stale HTTP 200. */
export function verifiedClubJoinModeResult(payload: unknown, mode: ClubJoinMode): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const rows = (payload as { clubs?: unknown }).clubs;
  if (!Array.isArray(rows) || rows.length > 100) return false;
  const seen = new Set<string>();
  return rows.every((row: unknown) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
    const club = row as Record<string, unknown>;
    if (typeof club.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(club.id) || seen.has(club.id)) return false;
    if (typeof club.name !== 'string' || club.name.length < 2 || club.name.length > 30 ||
        typeof club.tag !== 'string' || !/^[A-Z0-9]{2,8}$/.test(club.tag) ||
        typeof club.owner_name !== 'string' || typeof club.description !== 'string' ||
        club.status !== 'active' || typeof club.is_my_club !== 'boolean' ||
        !Number.isSafeInteger(club.member_count) || Number(club.member_count) < 0 ||
        !Number.isSafeInteger(club.level) || Number(club.level) < 1 ||
        typeof club.experience !== 'string' || !/^(0|[1-9][0-9]*)$/.test(club.experience)) return false;
    if (!['public', 'invite', 'request'].includes(String(club.join_mode))) return false;
    if (mode !== 'all' && club.join_mode !== mode) return false;
    seen.add(club.id);
    return true;
  });
}
