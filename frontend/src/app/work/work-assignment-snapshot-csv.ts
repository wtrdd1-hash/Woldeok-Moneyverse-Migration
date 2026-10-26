const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INTEGER = /^(0|[1-9][0-9]{0,18})$/;
const MAX = 9223372036854775807n;
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const STATUSES = new Set(['assigned', 'submitted', 'approved', 'rejected', 'expired']);

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid assignment');
  return value as Record<string, unknown>;
}

function exactDate(value: unknown): string {
  if (typeof value !== 'string' || !ISO.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value) {
    throw new Error('invalid assignment date');
  }
  return value;
}

function text(value: unknown, maxLength: number): string {
  if (typeof value !== 'string' || value.length < 1 || value.length > maxLength) throw new Error('invalid assignment field');
  return value;
}

function amount(value: unknown): string {
  if (value === null) return '';
  if (typeof value !== 'string' || !INTEGER.test(value) || BigInt(value) > MAX) throw new Error('invalid integer precision');
  return value;
}

function cell(value: string): string {
  const normalized = value.replace(/[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, ' ').trim();
  const protectedValue = /^[=+\-@]/.test(normalized) ? "'" + normalized : normalized;
  return '"' + protectedValue.replace(/"/g, '""') + '"';
}

/** Owner-only bounded assignment status, not a payment receipt or full history. */
export function workAssignmentSnapshotCsv(value: unknown): string {
  const data = record(value);
  if (data['scope'] !== 'recent_50_assignments_only' || data['source'] !== 'work_my_assignments' || data['limit'] !== 50) {
    throw new Error('unverified assignment scope');
  }
  const generatedAt = exactDate(data['generatedAt']);
  const assignments = data['assignments'];
  if (!Array.isArray(assignments) || assignments.length > 50) throw new Error('invalid assignment count');

  const header = [
    'Snapshot generated (UTC)', 'Assignment ID', 'Task ID', 'Task code', 'Task name',
    'Career', 'Status', 'Assigned (UTC)', 'Expires (UTC)', 'Recorded reward (WLD)',
    'Recorded experience (EXP)', 'Scope and limitations: Recent 50 assignments only; not a complete history or verified payment receipt',
  ];
  const notice = 'Recent 50 assignments only; not a complete history or verified payment receipt';
  const lines = assignments.map((entry) => {
    const row = record(entry);
    const assignmentId = text(row['assignmentId'], 36);
    const taskId = text(row['taskId'], 36);
    if (!UUID.test(assignmentId) || !UUID.test(taskId)) throw new Error('invalid assignment ID');
    const status = text(row['status'], 24);
    if (!STATUSES.has(status)) throw new Error('invalid assignment status');
    return [
      generatedAt, assignmentId, taskId, text(row['code'], 100), text(row['name'], 500),
      text(row['jobType'], 60), status, exactDate(row['assignedAt']), exactDate(row['expiresAt']),
      amount(row['rewardAmountWld']), amount(row['experienceAmount']), notice,
    ].map(cell).join(',');
  });
  return '\uFEFF' + [header.map(cell).join(','), ...lines].join('\r\n') + '\r\n';
}
