export interface VerifiedIpBlock {
  readonly block_id: string;
  readonly network: string;
  readonly reason: string;
  readonly blocked_by: string;
  readonly blocked_at: string;
  readonly expires_at: string | null;
  readonly lifted_by: string | null;
  readonly lifted_at: string | null;
  readonly active: boolean;
}

export const ADMIN_BLOCK_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/;

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function date(value: unknown): value is string {
  return typeof value === 'string' && ISO_DATE.test(value) && Number.isFinite(Date.parse(value));
}
function optionalDate(value: unknown): value is string | null {
  return value === null || date(value);
}
function network(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 64) return false;
  const [address = '', prefix, extra] = value.split('/');
  if (extra !== undefined) return false;
  let family = 0;
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(address) &&
      address.split('.').every((part) => Number(part) <= 255 && String(Number(part)) === part)) family = 4;
  else if (address.includes(':')) {
    try { if (new URL(`http://[${address}]/`).hostname.startsWith('[')) family = 6; } catch { /* invalid IPv6 */ }
  }
  if (family === 0) return false;
  return prefix === undefined || (/^\d{1,3}$/.test(prefix) && Number(prefix) <= (family === 4 ? 32 : 128));
}

/** Treat the API as untrusted until the complete operator action target is verified. */
export function parseAdminIpBlocks(raw: unknown): readonly VerifiedIpBlock[] | null {
  if (!object(raw) || !Array.isArray(raw.blocks) || raw.blocks.length > 100) return null;
  const ids = new Set<string>();
  const blocks: VerifiedIpBlock[] = [];
  for (const item of raw.blocks as unknown[]) {
    if (!object(item) || typeof item.block_id !== 'string' || !ADMIN_BLOCK_UUID.test(item.block_id) ||
        ids.has(item.block_id.toLowerCase()) || !network(item.network) ||
        typeof item.reason !== 'string' || item.reason.trim().length < 3 || item.reason.length > 1000 ||
        typeof item.blocked_by !== 'string' || !ADMIN_BLOCK_UUID.test(item.blocked_by) ||
        !date(item.blocked_at) || !optionalDate(item.expires_at) || !optionalDate(item.lifted_at) ||
        !(item.lifted_by === null || (typeof item.lifted_by === 'string' && ADMIN_BLOCK_UUID.test(item.lifted_by))) ||
        typeof item.active !== 'boolean' || (item.lifted_at !== null && item.active) ||
        ((item.lifted_at === null) !== (item.lifted_by === null))) return null;
    ids.add(item.block_id.toLowerCase());
    blocks.push(item as unknown as VerifiedIpBlock);
  }
  return blocks;
}
