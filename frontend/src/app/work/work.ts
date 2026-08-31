/**
 * The vocabulary of the work loop, and the small decisions its screen shares.
 *
 * Everything here is pure and lives outside `page.tsx` for the reason
 * `profile/profile.ts` and `progression/stages.ts` do: a page cannot be
 * rendered in a test -- that needs a live API and a database -- while the
 * words a member reads and the rules about which of them to show can be, and
 * they are the parts most likely to be got wrong.
 */

/** `public.work_task_board` (095), as the API returns it. */
export interface WorkTask {
  readonly task_id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly job_type: string;
  readonly difficulty: number;
  readonly base_reward: string;
  readonly base_experience: string;
  readonly minimum_duration_seconds: number;
  readonly daily_limit: number;
  readonly taken_today: number;
  /** Null when work rewards are switched off; '0' when the caps are spent. */
  readonly reward_preview: string | null;
  readonly recommended: boolean;
}

/** `public.work_my_assignments` (069). `status` is `work_assignment_status`. */
export interface WorkAssignment {
  readonly assignment_id: string;
  readonly task_id: string;
  readonly code: string;
  readonly name: string;
  readonly job_type: string;
  readonly status: string;
  readonly assigned_at: string;
  readonly expires_at: string;
  readonly reward_amount: string | null;
  readonly experience_amount: string | null;
}

/** `public.work_my_receipts` (095). A reward clamped to zero has no transaction. */
export interface WorkReceipt {
  readonly receipt_id: string;
  readonly assignment_id: string;
  readonly code: string;
  readonly name: string;
  readonly reward_amount: string;
  readonly experience_amount: string;
  readonly transaction_id: string | null;
  readonly created_at: string;
}

/** `public.work_my_dashboard` (069). Every amount is a bigint and stays a string. */
export interface WorkSummary {
  readonly daily_paid: string;
  readonly daily_cap: string;
  readonly weekly_paid: string;
  readonly weekly_cap: string;
  readonly active_assignments: string;
}

/**
 * `public.work_job_type` (066), in the Korean a member reads it in.
 *
 * The same map as `profile/profile.ts` holds, and deliberately a second copy
 * rather than an import: that module is the profile's vocabulary and this is
 * the work screen's, and a shared module between two features is the kind of
 * coupling that makes one of them unable to change its wording. A job this
 * build has not been taught renders as itself.
 */
const JOB_LABELS: Readonly<Record<string, string>> = {
  farmer: '농부',
  miner: '광부',
  carrier: '운반원',
  technician: '기술자',
  merchant: '상인',
};

export function jobLabel(code: string): string {
  return JOB_LABELS[code] ?? code;
}

/** `work_task_catalog.difficulty` is 1..5 (066). */
const DIFFICULTY_LABELS: readonly string[] = [
  '',
  '아주 쉬움',
  '쉬움',
  '보통',
  '어려움',
  '아주 어려움',
];

export function difficultyLabel(level: number): string {
  return DIFFICULTY_LABELS[level] ?? `${level}단계`;
}

/**
 * `public.work_assignment_status` (066), in Korean.
 *
 * 'assigned' is deliberately not called 진행 중 alone: what the member has to
 * know is that it is theirs and waiting on them.
 */
const STATUS_LABELS: Readonly<Record<string, string>> = {
  assigned: '진행 중',
  submitted: '제출함',
  approved: '지급 완료',
  rejected: '거절됨',
  expired: '기한 지남',
};

export function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

/** An assignment the member can still act on. */
export function isOpen(assignment: WorkAssignment): boolean {
  return assignment.status === 'assigned' || assignment.status === 'submitted';
}

/**
 * How long a task must be held before `work_submit_completion` will take it.
 *
 * 067 refuses a submission made before `minimum_duration_seconds` have passed
 * since the assignment, so the screen says the number rather than letting a
 * member press 제출 and be told no.
 */
export function durationLabel(seconds: number): string {
  if (seconds < 60) return `${seconds}초`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}분`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}시간` : `${hours}시간 ${rest}분`;
}

/**
 * Whether this assignment may be submitted yet, and how long is left.
 *
 * Computed from the two timestamps the API already returns rather than from a
 * countdown held in the browser: a page rendered on the server has one clock
 * and the member's tab may have another, and the database is the one that
 * decides. Returns 0 once the wait is over.
 */
export function secondsUntilSubmittable(
  assignedAt: string,
  minimumDurationSeconds: number,
  now: number,
): number {
  const ready = Date.parse(assignedAt) + minimumDurationSeconds * 1000;
  if (!Number.isFinite(ready)) return 0;
  return Math.max(0, Math.ceil((ready - now) / 1000));
}

/** True once `expires_at` has passed. 067 gives an assignment 24 hours. */
export function hasExpired(expiresAt: string, now: number): boolean {
  const at = Date.parse(expiresAt);
  return Number.isFinite(at) && at <= now;
}

/**
 * What is left of a cap, as a non-negative integer string.
 *
 * Both figures are bigints and arrive as strings, and both are small enough
 * that a Number is exact -- `daily_cap` is bounded at 1,000,000 and
 * `weekly_cap` at 10,000,000 by 066's CHECK constraints, which is why this
 * may subtract them as numbers where `lib/money.ts` refuses to.
 */
export function remaining(paid: string, cap: string): string {
  const left = Number(cap) - Number(paid);
  return String(Number.isFinite(left) && left > 0 ? Math.floor(left) : 0);
}

/** A percentage for a progress bar, clamped to 0..100. */
export function progressPercent(paid: string, cap: string): number {
  const total = Number(cap);
  const done = Number(paid);
  if (!Number.isFinite(total) || total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((done / total) * 100)));
}

/**
 * What a task will pay, said honestly.
 *
 * `reward_preview` is what 095 says verifying it right now would mint: the
 * base reward less the repeat decay, clamped to both caps. It is the only
 * number worth showing. Null and '0' are different facts and get different
 * sentences; showing the catalogue price in either case would advertise money
 * this application will not pay.
 */
export function rewardSentence(task: WorkTask): string {
  if (task.reward_preview === null) return '지금은 작업 보상 지급이 멈춰 있어요.';
  if (task.reward_preview === '0') {
    return '오늘 받을 수 있는 보상을 모두 채웠어요. 경험치는 그대로 쌓여요.';
  }
  if (task.reward_preview !== task.base_reward) {
    return `지금 마치면 ${task.reward_preview} WLD를 받아요. 기본 ${task.base_reward} WLD에서 오늘 반복한 만큼 줄어든 금액이에요.`;
  }
  return `지금 마치면 ${task.reward_preview} WLD를 받아요.`;
}

/** True when the member has taken this task as often as 066 allows today. */
export function isSpent(task: WorkTask): boolean {
  return task.taken_today >= task.daily_limit;
}

/**
 * The three the board suggests, then everything else.
 *
 * 095 marks the suggestions and keeps them stable for the day; this only
 * decides the order they are shown in, so a member reads the three they are
 * being pointed at before the rest of the catalogue.
 */
export function boardOrder(tasks: readonly WorkTask[]): readonly WorkTask[] {
  return [...tasks].sort((left, right) => Number(right.recommended) - Number(left.recommended));
}
