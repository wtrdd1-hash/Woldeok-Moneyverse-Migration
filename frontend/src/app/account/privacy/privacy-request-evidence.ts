/** Owner-scoped Nest privacy_list_my_requests projection; never infer an empty list from an invalid response. */
export interface OwnerPrivacyRequest {
  readonly requestId: string;
  readonly requestType: 'access' | 'correction' | 'restriction' | 'withdrawal' | 'deletion';
  readonly detail: string | null;
  readonly status: 'received';
  readonly createdAt: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TYPES = new Set(['access', 'correction', 'restriction', 'withdrawal', 'deletion']);
const KEYS = new Set(['requestId', 'requestType', 'detail', 'status', 'createdAt']);

export function parseOwnerPrivacyRequests(
  payload: unknown,
  filter: string | null = null,
): OwnerPrivacyRequest[] | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload) ||
      !('requests' in payload) || !Array.isArray(payload.requests) || payload.requests.length > 30 ||
      (filter !== null && !TYPES.has(filter))) return null;

  const seen = new Set<string>();
  const verified: OwnerPrivacyRequest[] = [];
  let lastTimestamp = Number.POSITIVE_INFINITY;
  let lastId = '';
  for (const raw of payload.requests) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const row = raw as Record<string, unknown>;
    if (Object.keys(row).some((key) => !KEYS.has(key)) ||
        typeof row.requestId !== 'string' || !UUID.test(row.requestId) ||
        seen.has(row.requestId.toLowerCase()) ||
        typeof row.requestType !== 'string' || !TYPES.has(row.requestType) ||
        (filter !== null && row.requestType !== filter) || row.status !== 'received' ||
        typeof row.createdAt !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(row.createdAt)) return null;
    const when = Date.parse(row.createdAt);
    if (!Number.isFinite(when) || new Date(when).toISOString() !== row.createdAt ||
        when > Date.now() + 300_000 || when > lastTimestamp ||
        (when === lastTimestamp && row.requestId.toLowerCase() > lastId)) return null;
    if (row.detail !== null && (typeof row.detail !== 'string' || row.detail.length === 0 ||
        row.detail.length > 1000 || row.detail.trim() !== row.detail ||
        /[<>\u0000-\u001f\u007f]/.test(row.detail) || /\s{2,}/.test(row.detail))) return null;
    seen.add(row.requestId.toLowerCase());
    lastTimestamp = when;
    lastId = row.requestId.toLowerCase();
    verified.push({
      requestId: row.requestId,
      requestType: row.requestType as OwnerPrivacyRequest['requestType'],
      detail: row.detail as string | null,
      status: 'received',
      createdAt: row.createdAt,
    });
  }
  return verified;
}
