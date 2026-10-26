import { ServiceUnavailableException } from '@nestjs/common';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const BIGINT = /^(0|[1-9][0-9]{0,18})$/;
const BIGINT_MAX = 9223372036854775807n;
const STATUSES = new Set(['assigned', 'submitted', 'approved', 'rejected', 'expired']);

export interface WorkAssignmentSnapshot {
  readonly scope: 'recent_50_assignments_only';
  readonly source: 'work_my_assignments';
  readonly limit: 50;
  readonly generatedAt: string;
  readonly assignments: readonly {
    readonly assignmentId: string;
    readonly taskId: string;
    readonly code: string;
    readonly name: string;
    readonly jobType: string;
    readonly status: string;
    readonly assignedAt: string;
    readonly expiresAt: string;
    readonly rewardAmountWld: string | null;
    readonly experienceAmount: string | null;
  }[];
}

function unavailable(): never {
  throw new ServiceUnavailableException('verified work assignments unavailable');
}

function text(value: unknown, maxLength: number): string {
  if (typeof value !== 'string' || value.length === 0 || value.length > maxLength) unavailable();
  return value;
}

function bigintString(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== 'string' || !BIGINT.test(value) || BigInt(value) > BIGINT_MAX) unavailable();
  return value;
}

function timestamp(value: unknown): string {
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) unavailable();
  return value.toISOString();
}

/** Database read is already owner-filtered; this projection refuses malformed or rounded records. */
export function toWorkAssignmentSnapshot(rows: unknown, now: Date): WorkAssignmentSnapshot {
  if (!Array.isArray(rows) || rows.length > 50 || !Number.isFinite(now.getTime())) unavailable();
  const assignments = rows.map((value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) unavailable();
    const row = value as Record<string, unknown>;
    const assignmentId = text(row['assignment_id'], 36);
    const taskId = text(row['task_id'], 36);
    if (!UUID.test(assignmentId) || !UUID.test(taskId)) unavailable();
    const status = text(row['status'], 24);
    if (!STATUSES.has(status)) unavailable();
    return {
      assignmentId,
      taskId,
      code: text(row['code'], 100),
      name: text(row['name'], 500),
      jobType: text(row['job_type'], 60),
      status,
      assignedAt: timestamp(row['assigned_at']),
      expiresAt: timestamp(row['expires_at']),
      rewardAmountWld: bigintString(row['reward_amount']),
      experienceAmount: bigintString(row['experience_amount']),
    };
  });
  return {
    scope: 'recent_50_assignments_only',
    source: 'work_my_assignments',
    limit: 50,
    generatedAt: now.toISOString(),
    assignments,
  };
}
