/** Runtime evidence boundary for the authenticated PostgreSQL club directory. */
export interface VerifiedClub {
  readonly id: string;
  readonly tag: string;
  readonly name: string;
  readonly description: string;
  readonly owner_id: string;
  readonly owner_name: string;
  readonly join_mode: 'public' | 'invite' | 'request';
  readonly status: 'active';
  readonly level: number;
  readonly experience: string;
  readonly member_count: number;
  readonly created_at: string;
  readonly is_my_club: boolean;
  readonly my_role: string | null;
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const decimal = /^(0|[1-9][0-9]*)$/;
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function isVerifiedClub(value: unknown): value is VerifiedClub {
  if (!record(value)) return false;
  return typeof value.id === 'string' && uuid.test(value.id) &&
    typeof value.owner_id === 'string' && uuid.test(value.owner_id) &&
    typeof value.tag === 'string' && /^[A-Z0-9]{2,8}$/.test(value.tag) &&
    typeof value.name === 'string' && value.name.length >= 2 && value.name.length <= 100 &&
    typeof value.description === 'string' && typeof value.owner_name === 'string' &&
    ['public', 'invite', 'request'].includes(String(value.join_mode)) &&
    value.status === 'active' &&
    typeof value.level === 'number' && Number.isSafeInteger(value.level) && value.level >= 0 &&
    typeof value.experience === 'string' && value.experience.length <= 40 && decimal.test(value.experience) &&
    typeof value.member_count === 'number' && Number.isSafeInteger(value.member_count) && value.member_count >= 0 &&
    typeof value.created_at === 'string' && Number.isFinite(Date.parse(value.created_at)) &&
    typeof value.is_my_club === 'boolean' &&
    (value.my_role === null || typeof value.my_role === 'string') &&
    (!value.is_my_club || (typeof value.my_role === 'string' && value.my_role.length > 0));
}

export function parseClubDirectoryResponse(response: unknown): VerifiedClub[] | null {
  if (!record(response) || !Array.isArray(response.clubs) || response.clubs.length > 50) return null;
  const seen = new Set<string>();
  for (const club of response.clubs) {
    if (!isVerifiedClub(club) || seen.has(club.id.toLowerCase())) return null;
    seen.add(club.id.toLowerCase());
  }
  return response.clubs as VerifiedClub[];
}

export function clubDirectoryHref(search: string, offset: number): string {
  const query = new URLSearchParams();
  if (search) query.set('search', search);
  query.set('offset', String(offset));
  return `/clubs?${query.toString()}`;
}
