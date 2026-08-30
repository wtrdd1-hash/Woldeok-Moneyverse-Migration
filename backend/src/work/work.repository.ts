import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class WorkInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkInputError';
  }
}

/**
 * Validated here as well as in the database function. The double gate is
 * deliberate and documented across this codebase: the function is the
 * authority, and this turns a malformed argument into a 400 with a sentence
 * about the field rather than a 500 carrying a message about a function.
 */
function assertUuid(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || !UUID.test(value)) {
    throw new WorkInputError(`${field} must be a UUID`);
  }
}

/** Reward and experience are bigints, so they stay strings end to end. */
export interface WorkAssignmentRow {
  assignment_id: string;
  task_id: string;
  assigned_at: Date;
  expires_at: Date;
  replayed: boolean;
}

export interface WorkCompletionRow {
  assignment_id: string;
  submitted_at: Date;
  replayed: boolean;
}

export interface WorkRewardRow {
  assignment_id: string;
  reward_amount: string;
  experience_amount: string;
  transaction_id: string | null;
  replayed: boolean;
}

export interface WorkDashboardRow {
  daily_paid: string;
  daily_cap: string;
  weekly_paid: string;
  weekly_cap: string;
  active_assignments: string;
}

export class WorkRepository {
  constructor(private readonly pool: Queryable) {}

  assign(key: unknown, actor: unknown, task: unknown): Promise<WorkAssignmentRow | null> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    assertUuid(task, 'task id');
    return queryOne<WorkAssignmentRow>(
      this.pool,
      `SELECT assignment.assignment_id::text, assignment.task_id::text,
              assignment.assigned_at, assignment.expires_at, assignment.replayed
       FROM public.work_assign_task($1, $2, $3) AS assignment`,
      [key, actor, task],
    );
  }

  submit(
    key: unknown,
    actor: unknown,
    assignment: unknown,
    evidence?: string,
  ): Promise<WorkCompletionRow | null> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    assertUuid(assignment, 'assignment id');
    return queryOne<WorkCompletionRow>(
      this.pool,
      `SELECT completion.assignment_id::text, completion.submitted_at, completion.replayed
       FROM public.work_submit_completion($1, $2, $3, $4) AS completion`,
      [key, actor, assignment, evidence ?? null],
    );
  }

  verify(key: unknown, actor: unknown, assignment: unknown): Promise<WorkRewardRow | null> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    assertUuid(assignment, 'assignment id');
    return queryOne<WorkRewardRow>(
      this.pool,
      `SELECT reward.assignment_id::text, reward.reward_amount::text,
              reward.experience_amount::text, reward.transaction_id::text, reward.replayed
       FROM public.work_verify_and_reward($1, $2, $3) AS reward`,
      [key, actor, assignment],
    );
  }

  dashboard(actor: unknown): Promise<WorkDashboardRow | null> {
    assertUuid(actor, 'actor');
    return queryOne<WorkDashboardRow>(
      this.pool,
      `SELECT summary.daily_paid::text, summary.daily_cap::text,
              summary.weekly_paid::text, summary.weekly_cap::text,
              summary.active_assignments::text
       FROM public.work_my_dashboard($1) AS summary`,
      [actor],
    );
  }

  assignments(actor: unknown): Promise<unknown[]> {
    assertUuid(actor, 'actor');
    return queryRows(
      this.pool,
      `SELECT item.assignment_id::text, item.task_id::text, item.code, item.name,
              item.job_type::text, item.status::text, item.assigned_at, item.expires_at,
              item.reward_amount::text, item.experience_amount::text
       FROM public.work_my_assignments($1) AS item`,
      [actor],
    );
  }
}
