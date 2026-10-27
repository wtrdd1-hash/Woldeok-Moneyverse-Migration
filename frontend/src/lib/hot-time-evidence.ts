import type { HotTimeBuffItem, HotTimePayload } from '@/components/live-hot-time-banner';

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function validDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d/.test(value) && Number.isFinite(Date.parse(value));
}

/** Treat a broken or contradictory response as unavailable, never as a zero-event result. */
export function parseHotTimeEvidence(value: unknown): HotTimePayload | null {
  if (!record(value) || !validDate(value.serverTime) || typeof value.hasActiveHotTime !== 'boolean' || !Array.isArray(value.activeBuffs) || value.activeBuffs.length > 100) return null;
  const serverTime = Date.parse(value.serverTime);
  const seen = new Set<string>();
  const buffs: HotTimeBuffItem[] = [];
  for (const item of value.activeBuffs as unknown[]) {
    if (!record(item) || typeof item.id !== 'string' || !item.id.trim() || typeof item.buffKey !== 'string' || !item.buffKey.trim() || seen.has(item.buffKey) || typeof item.title !== 'string' || !item.title.trim() || typeof item.description !== 'string' || typeof item.targetDomain !== 'string' || !item.targetDomain.trim() || typeof item.multiplier !== 'number' || !Number.isFinite(item.multiplier) || item.multiplier <= 0 || item.multiplier > 100 || item.active !== true || !validDate(item.startsAt) || !validDate(item.endsAt) || Date.parse(item.startsAt) > serverTime || Date.parse(item.endsAt) <= serverTime) return null;
    seen.add(item.buffKey);
    buffs.push(item as unknown as HotTimeBuffItem);
  }
  if (value.hasActiveHotTime !== (buffs.length > 0)) return null;
  return { activeBuffs: buffs, hasActiveHotTime: value.hasActiveHotTime, serverTime: value.serverTime };
}
