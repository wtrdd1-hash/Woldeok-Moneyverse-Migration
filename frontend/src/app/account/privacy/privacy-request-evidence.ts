/** The browser must not infer a data-subject request was recorded from an unverified response. */
export interface VerifiedPrivacyRequest {
  readonly requestId: string;
  readonly requestType: 'access' | 'correction' | 'restriction' | 'withdrawal' | 'deletion';
  readonly detail: string | null;
  readonly status: 'received';
  readonly createdAt: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const TYPES = new Set(['access', 'correction', 'restriction', 'withdrawal', 'deletion']);

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function canonicalTime(value: unknown): value is string {
  if (typeof value !== 'string' || !ISO.test(value)) return false;
  const date = new Date(value);
  return Number.isFinite(date.valueOf()) && date.toISOString() === value;
}

/** Null is unverified; [] means the owner-scoped PostgreSQL read verified an empty window. */
export function parsePrivacyRequestHistory(
  value: unknown,
  selectedType: string | null,
): readonly VerifiedPrivacyRequest[] | null {
  if (selectedType !== null && !TYPES.has(selectedType)) return null;
  if (!record(value) || !Array.isArray(value.requests) || value.requests.length > 30) return null;
  const seen = new Set<string>();
  const result: VerifiedPrivacyRequest[] = [];
  let previousTime = Infinity;
  for (const raw of value.requests) {
    if (!record(raw) || typeof raw.requestId !== 'string' || !UUID.test(raw.requestId) ||
      typeof raw.requestType !== 'string' || !TYPES.has(raw.requestType) ||
      (selectedType !== null && raw.requestType !== selectedType) ||
      raw.status !== 'received' || !canonicalTime(raw.createdAt) ||
      (raw.detail !== null && (typeof raw.detail !== 'string' ||
        raw.detail.length === 0 || raw.detail.length > 1000 ||
        raw.detail !== raw.detail.trim() || /[<>\u0000-\u001f\u007f]/.test(raw.detail)))) return null;
    const id = raw.requestId.toLowerCase();
    const time = Date.parse(raw.createdAt);
    // SQL orders by microseconds but Nest serializes timestamps to milliseconds.
    if (seen.has(id) || time > previousTime) return null;
    seen.add(id);
    previousTime = time;
    result.push({
      requestId: raw.requestId,
      requestType: raw.requestType as VerifiedPrivacyRequest['requestType'],
      detail: raw.detail as string | null,
      status: 'received',
      createdAt: raw.createdAt,
    });
  }
  return result;
}
