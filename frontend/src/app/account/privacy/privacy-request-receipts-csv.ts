/** CSV of the caller's recent intake receipts, NOT an export of personal data. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TYPES = new Set(['access', 'correction', 'restriction', 'withdrawal', 'deletion']);
const FIELDS = ['requestId', 'requestType', 'status', 'createdAt', 'detail'];

function record(value: unknown, allowed: readonly string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid intake receipt');
  const object = value as Record<string, unknown>;
  if (Object.keys(object).some((key) => !allowed.includes(key))) throw new Error('unrecognized private field');
  return object;
}

function cell(value: string): string {
  const clean = value.replace(/[\u0000-\u001f\u007f\u2028\u2029]/g, ' ').trim().replace(/^[\u200b-\u200d\u2060\ufeff]+/g, '').trim();
  const safe = /^[=+\-@]/.test(clean) ? `'${clean}` : clean;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function privacyRequestReceiptsCsv(value: unknown): string {
  const snapshot = record(value, ['scope', 'limit', 'requests']);
  if (snapshot.scope !== 'recent_intake_receipts' || snapshot.limit !== 30 || !Array.isArray(snapshot.requests) || snapshot.requests.length > 30) {
    throw new Error('unverified intake snapshot');
  }
  const seen = new Set<string>();
  const lines = ['request_id,request_type,status,created_at,detail'];
  for (const item of snapshot.requests) {
    const row = record(item, FIELDS);
    const { requestId, requestType, status, createdAt, detail } = row;
    if (typeof requestId !== 'string' || !UUID.test(requestId) || seen.has(requestId.toLowerCase())) throw new Error('invalid or duplicate receipt id');
    if (typeof requestType !== 'string' || !TYPES.has(requestType) || status !== 'received') throw new Error('unverified intake status');
    if (typeof createdAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(createdAt) || new Date(createdAt).toISOString() !== createdAt) {
      throw new Error('invalid receipt date');
    }
    if (detail !== null && (typeof detail !== 'string' || detail.length > 1000)) throw new Error('invalid receipt detail');
    seen.add(requestId.toLowerCase());
    lines.push([requestId, requestType, status, createdAt, detail ?? ''].map((part) => cell(part as string)).join(','));
  }
  return `\uFEFF${lines.join('\r\n')}\r\n`;
}
