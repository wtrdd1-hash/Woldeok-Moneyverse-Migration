import 'server-only';

import { isIP } from 'node:net';

/** Verified shape returned by admin_list_ip_blocks($1, 100), not the database row's internal id. */
export interface AdminIpBlock {
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

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isValidIpBlockId(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}

function timestamp(value: unknown): value is string {
  return typeof value === 'string' && TIMESTAMP.test(value) && Number.isFinite(Date.parse(value));
}

function nullableTimestamp(value: unknown): value is string | null {
  return value === null || timestamp(value);
}

function nullableId(value: unknown): value is string | null {
  return value === null || isValidIpBlockId(value);
}

function validNetwork(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 64) return false;
  const parts = value.split('/');
  if (parts.length > 2) return false;
  const version = isIP(parts[0] ?? '');
  if (version === 0) return false;
  if (parts.length === 1) return true;
  const bits = parts[1];
  return typeof bits === 'string' && /^(0|[1-9]\d{0,2})$/.test(bits) &&
    Number(bits) <= (version === 4 ? 32 : 128);
}

function validBlock(value: unknown): value is AdminIpBlock {
  if (!record(value) || !isValidIpBlockId(value.block_id) || !validNetwork(value.network) ||
      !isValidIpBlockId(value.blocked_by) || typeof value.reason !== 'string' ||
      value.reason.trim().length === 0 || value.reason.length > 1000 ||
      !timestamp(value.blocked_at) || !nullableTimestamp(value.expires_at) ||
      !nullableTimestamp(value.lifted_at) || !nullableId(value.lifted_by) ||
      typeof value.active !== 'boolean') return false;

  const blockedAt = Date.parse(value.blocked_at);
  if (value.expires_at !== null && Date.parse(value.expires_at) < blockedAt) return false;
  if (value.lifted_at !== null && Date.parse(value.lifted_at) < blockedAt) return false;
  if ((value.lifted_at === null) !== (value.lifted_by === null)) return false;
  if (value.active && value.lifted_at !== null) return false;
  // A record without an expiry or lift cannot truthfully be inactive.
  if (!value.active && value.expires_at === null && value.lifted_at === null) return false;
  return true;
}

/** A failed or inconsistent read is unknown, never a verified zero-block state. */
export function parseAdminIpBlocks(value: unknown): readonly AdminIpBlock[] | null {
  if (!record(value) || !Array.isArray(value.blocks) || value.blocks.length > 100 ||
      !value.blocks.every(validBlock)) return null;
  const blocks: AdminIpBlock[] = value.blocks;
  if (new Set(blocks.map((block) => block.block_id)).size !== blocks.length) return null;
  return blocks;
}
