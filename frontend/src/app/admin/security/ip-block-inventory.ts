/** This is the wire contract returned by the privileged PostgreSQL listing function. */
export interface AdminIpBlock {
  readonly block_id: string;
  readonly network: string;
  readonly reason: string;
  readonly blocked_at: string;
  readonly expires_at: string | null;
  readonly lifted_at: string | null;
  readonly active: boolean;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isDateTime(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '' && Number.isFinite(Date.parse(value));
}

function isNullableDateTime(value: unknown): value is string | null {
  return value === null || isDateTime(value);
}

function isBlock(value: unknown): value is AdminIpBlock {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  return typeof row.block_id === 'string' && UUID.test(row.block_id)
    && typeof row.network === 'string' && row.network.trim().length > 0 && row.network.length <= 128
    && typeof row.reason === 'string'
    && isDateTime(row.blocked_at)
    && isNullableDateTime(row.expires_at)
    && isNullableDateTime(row.lifted_at)
    && typeof row.active === 'boolean';
}

/** Null means unavailable or untrusted; an empty array is a verified empty inventory. */
export function verifiedIpBlocks(value: unknown): readonly AdminIpBlock[] | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return null;
  const blocks = (value as Record<string, unknown>).blocks;
  if (!Array.isArray(blocks) || blocks.length > 100 || !blocks.every(isBlock)) return null;
  const ids = new Set(blocks.map((row: AdminIpBlock) => row.block_id.toLowerCase()));
  return ids.size === blocks.length ? blocks : null;
}
