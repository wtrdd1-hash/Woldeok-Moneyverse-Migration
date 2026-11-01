/** Verified, owner-scoped read model; no browser storage or simulated WLD ledger. */
export interface VerifiedPersonalSpace {
  readonly id: string;
  readonly name: string;
  readonly spaceType: string;
  readonly privacy: 'private' | 'public' | 'club';
  readonly updatedAt: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
const TYPES = new Set(['SPACE_ROOM_STARTER', 'SPACE_STUDIO', 'SPACE_GALLERY', 'SPACE_OFFICE', 'SPACE_PENTHOUSE', 'SPACE_HQ']);
const PRIVACY = new Set(['private', 'public', 'club']);
const FIELDS = new Set(['id', 'user_id', 'space_type', 'name', 'privacy', 'layout', 'created_at', 'updated_at', 'userId', 'spaceType', 'createdAt', 'updatedAt']);

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function date(value: unknown): value is string {
  if (typeof value !== 'string' || !ISO.test(value)) return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 19) === value.slice(0, 19);
}

export function parseVerifiedPersonalSpaces(value: unknown): readonly VerifiedPersonalSpace[] | null {
  if (!record(value) || !Array.isArray(value.spaces) || value.spaces.length > 500) return null;
  const seen = new Set<string>();
  let owner: string | null = null;
  const result: VerifiedPersonalSpace[] = [];
  for (const entry of value.spaces as unknown[]) {
    if (!record(entry) || Object.keys(entry).some((key) => !FIELDS.has(key))) return null;
    const id = entry.id;
    const userId = entry.user_id ?? entry.userId;
    const spaceType = entry.space_type ?? entry.spaceType;
    const created = entry.created_at ?? entry.createdAt;
    const updated = entry.updated_at ?? entry.updatedAt;
    if (typeof id !== 'string' || !UUID.test(id) || seen.has(id.toLowerCase()) ||
        typeof userId !== 'string' || !UUID.test(userId) ||
        (owner !== null && owner.toLowerCase() !== userId.toLowerCase()) ||
        typeof spaceType !== 'string' || !TYPES.has(spaceType) ||
        typeof entry.name !== 'string' || entry.name.trim().length < 1 || entry.name.length > 50 ||
        typeof entry.privacy !== 'string' || !PRIVACY.has(entry.privacy) ||
        !record(entry.layout) || !date(created) || !date(updated) || Date.parse(created) > Date.parse(updated)) return null;
    owner = userId;
    seen.add(id.toLowerCase());
    result.push({ id, name: entry.name, spaceType, privacy: entry.privacy as VerifiedPersonalSpace['privacy'], updatedAt: updated });
  }
  return result;
}
