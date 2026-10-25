/**
 * Read-only current-week goal snapshot. This is not an immutable receipt,
 * a complete historical archive or proof of a WLD payout.
 */
const AMOUNT = /^(0|[1-9][0-9]{0,37})$/;
const CODE = /^[a-z][a-z0-9_]{0,79}$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

function cell(input: string): string {
  const clean = input.replace(/[\u0000-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, ' ').trim();
  const safe = /^[=+\-@]/.test(clean) ? "'" + clean : clean;
  return '"' + safe.replace(/"/g, '""') + '"';
}

function safeText(value: unknown, field: string, max = 300): string {
  if (typeof value !== 'string' || value.length < 1 || value.length > max) {
    throw new Error('unverified quest ' + field);
  }
  return value;
}

function safeDay(value: unknown): string {
  if (typeof value !== 'string' || !DAY.test(value)) throw new Error('invalid week');
  const date = new Date(value + 'T00:00:00.000Z');
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error('invalid week');
  }
  return value;
}

function csvRow(value: unknown): { week: string; code: string; cells: string[] } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid goal');
  const row = value as Record<string, unknown>;
  const code = safeText(row['goal_code'], 'code', 80);
  if (!CODE.test(code)) throw new Error('invalid goal code');
  const label = safeText(row['goal_label'], 'label');
  const detail = safeText(row['goal_detail'], 'detail', 600);
  const metric = safeText(row['goal_metric'], 'metric', 80);
  const window = row['goal_window'];
  if (window !== 'week' && window !== 'lifetime') throw new Error('invalid goal window');
  const unit = safeText(row['goal_unit'], 'unit', 40);
  const target = row['goal_target'];
  const progress = row['goal_progress'];
  if (typeof target !== 'string' || !AMOUNT.test(target) ||
      typeof progress !== 'string' || !AMOUNT.test(progress)) {
    throw new Error('invalid goal amount');
  }
  if (typeof row['goal_self_reported'] !== 'boolean' || typeof row['goal_completed'] !== 'boolean') {
    throw new Error('invalid goal status');
  }
  const week = safeDay(row['week_start']);
  return {
    week,
    code,
    cells: [
      code, label, detail, metric, window, week, progress, target, unit,
      row['goal_completed'] ? 'yes' : 'no',
      row['goal_self_reported'] ? 'self-reported NPC order' : 'derived from recorded activity',
      'current-week snapshot, not a payout receipt; lifetime goals are all-time',
    ],
  };
}

/** Reject the whole export before streaming a single byte on inconsistent data. */
export function weeklyGoalsCsv(data: unknown): string {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('quest snapshot unavailable');
  const snapshot = data as Record<string, unknown>;
  if (snapshot['scope'] !== 'current_week_only' ||
      !Array.isArray(snapshot['goals']) || snapshot['goals'].length > 12) {
    throw new Error('unverified quest snapshot');
  }
  const rows = snapshot['goals'].map((row: unknown) => csvRow(row));
  if (new Set(rows.map((row) => row.week)).size > 1 ||
      new Set(rows.map((row) => row.code)).size !== rows.length) {
    throw new Error('inconsistent quest snapshot');
  }
  const header = [
    'Goal code', 'Goal label', 'Detail', 'Metric', 'Window', 'Week starting (Seoul)',
    'Progress (integer string)', 'Target (integer string)', 'Unit', 'Completed',
    'Evidence class', 'Scope and limitations',
  ];
  return '\uFEFF' + [header.map(cell).join(','), ...rows.map((row) => row.cells.map(cell).join(','))].join('\r\n') + '\r\n';
}
