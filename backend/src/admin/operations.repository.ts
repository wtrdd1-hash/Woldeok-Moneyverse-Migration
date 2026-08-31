import { Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

/**
 * The three operations screens of spec 14.9 that the console never grew:
 * work and jobs, the bank and its loan book, and Discord delivery.
 *
 * Every method calls a SECURITY DEFINER function from migration 106. None of
 * the tables behind them is readable by `moneyverse_app`, and each function
 * re-decides the caller's authority for itself -- the guards on the
 * controllers decide who may knock, not who may read.
 *
 * Every bigint and numeric is cast to text in the query and stays a string
 * all the way to the browser. A loan balance, an experience total and an
 * outbox count are all values `Number` would round, and money is a string end
 * to end everywhere else in this codebase.
 */

export class OperationsInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OperationsInputError';
  }
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** The bound `admin_loan_book` enforces, repeated so the message names the field. */
const LOAN_LIMIT_MAX = 200;

function assertUuid(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    throw new OperationsInputError(`${field} must be a UUID`);
  }
}

function assertLoanLimit(value: unknown): asserts value is number {
  if (!Number.isSafeInteger(value) || (value as number) < 1 || (value as number) > LOAN_LIMIT_MAX) {
    throw new OperationsInputError(`limit must be an integer between 1 and ${LOAN_LIMIT_MAX}`);
  }
}

/** packages/database/migrations/106-admin-operations-read-models.sql */
export interface WorkCatalogueRow {
  readonly task_id: string;
  readonly code: string;
  readonly name: string;
  readonly job_type: string;
  readonly difficulty: number;
  readonly base_reward: string;
  readonly base_experience: string;
  readonly minimum_duration_seconds: number;
  readonly daily_limit: number;
  readonly active: boolean;
  readonly open_assignment_count: string;
  readonly awaiting_verification_count: string;
  readonly approved_24h: string;
  readonly rejected_24h: string;
  readonly paid_24h: string;
  readonly last_assigned_at: Date | null;
}

/** packages/database/migrations/106-admin-operations-read-models.sql */
export interface JobLevelRow {
  readonly job_type: string;
  readonly member_count: string;
  readonly average_level: string;
  readonly top_level: number;
  readonly total_experience: string;
  readonly active_7d_count: string;
}

/**
 * packages/database/migrations/106-admin-operations-read-models.sql.
 *
 * The first seven fields are null together when no reward policy is in force.
 * That is a state, not a failure -- the counts beside them are still real,
 * and a screen has to be able to say "nothing is in force" rather than go
 * blank.
 */
export interface WorkPolicyRow {
  readonly policy_id: number | null;
  readonly effective_at: Date | null;
  readonly daily_cap: string | null;
  readonly weekly_cap: string | null;
  readonly repeat_decay_percent: number | null;
  readonly enabled: boolean | null;
  readonly reason: string | null;
  readonly active_task_count: string;
  readonly open_assignment_count: string;
  readonly awaiting_verification_count: string;
  readonly paid_24h: string;
  readonly members_paid_24h: string;
  readonly experience_24h: string;
}

/** packages/database/migrations/106-admin-operations-read-models.sql */
export interface BankOverviewRow {
  readonly deposit_amount: string;
  readonly depositor_count: string;
  readonly open_loan_count: string;
  readonly outstanding_amount: string;
  readonly overdue_loan_count: string;
  readonly overdue_amount: string;
  readonly maturing_7d_count: string;
  readonly issued_24h_count: string;
  readonly issued_24h_amount: string;
  readonly repaid_24h_amount: string;
  readonly borrower_count: string;
}

/** packages/database/migrations/106-admin-operations-read-models.sql */
export interface CreditGradeRow {
  readonly grade: string;
  readonly minimum_account_days: number;
  readonly minimum_work_completions: number;
  readonly credit_limit: string;
  readonly interest_bps: number;
  readonly term_days: number;
  readonly minimum_repayment: string;
  readonly active: boolean;
  readonly open_loan_count: string;
  readonly outstanding_amount: string;
  readonly overdue_loan_count: string;
  readonly issued_loan_count: string;
  readonly issued_principal: string;
}

/** packages/database/migrations/106-admin-operations-read-models.sql */
export interface LoanBookRow {
  readonly loan_id: string;
  readonly user_id: string;
  readonly display_name: string;
  readonly credit_grade: string;
  readonly status: string;
  readonly principal_amount: string;
  readonly interest_amount: string;
  readonly outstanding_amount: string;
  readonly repaid_amount: string;
  readonly minimum_repayment: string;
  readonly issued_at: Date;
  readonly maturity_at: Date | null;
  readonly overdue_at: Date | null;
  readonly status_reason: string | null;
}

/** packages/database/migrations/106-admin-operations-read-models.sql */
export interface OutboxHealthRow {
  readonly pending_count: string;
  readonly retry_pending_count: string;
  readonly delivering_count: string;
  readonly delivered_count: string;
  readonly dead_letter_count: string;
  readonly suppressed_count: string;
  readonly delivered_24h_count: string;
  readonly stuck_count: string;
  readonly oldest_undelivered_at: Date | null;
  readonly last_delivered_at: Date | null;
  readonly last_failure_at: Date | null;
  readonly unrouted_type_count: string;
}

/**
 * packages/database/migrations/106-admin-operations-read-models.sql.
 *
 * `routed` false means there is no row in `discord_outbox_routes` for this
 * type, so `outbox_claim_pending` will never claim it -- the four route
 * fields are null there because there is no route to describe.
 */
export interface DiscordRouteRow {
  readonly event_type: string;
  readonly channel_key: string | null;
  readonly enabled: boolean | null;
  readonly note: string | null;
  readonly routed: boolean;
  readonly total_count: string;
  readonly pending_count: string;
  readonly dead_letter_count: string;
  readonly suppressed_count: string;
  readonly delivered_24h_count: string;
  readonly last_delivered_at: Date | null;
}

@Injectable()
export class OperationsRepository {
  readonly pool: Queryable;

  constructor(pool: Queryable) {
    this.pool = pool;
  }

  workCatalogue(actorUserId: unknown): Promise<WorkCatalogueRow[]> {
    assertUuid(actorUserId, 'actor user id');
    return queryRows<WorkCatalogueRow>(
      this.pool,
      `SELECT task_row.task_id::text AS task_id,
              task_row.code,
              task_row.name,
              task_row.job_type,
              task_row.difficulty,
              task_row.base_reward::text AS base_reward,
              task_row.base_experience::text AS base_experience,
              task_row.minimum_duration_seconds,
              task_row.daily_limit,
              task_row.active,
              task_row.open_assignment_count::text AS open_assignment_count,
              task_row.awaiting_verification_count::text AS awaiting_verification_count,
              task_row.approved_24h::text AS approved_24h,
              task_row.rejected_24h::text AS rejected_24h,
              task_row.paid_24h::text AS paid_24h,
              task_row.last_assigned_at
       FROM public.admin_work_catalogue($1) AS task_row`,
      [actorUserId],
    );
  }

  jobLevels(actorUserId: unknown): Promise<JobLevelRow[]> {
    assertUuid(actorUserId, 'actor user id');
    return queryRows<JobLevelRow>(
      this.pool,
      `SELECT job_row.job_type,
              job_row.member_count::text AS member_count,
              job_row.average_level::text AS average_level,
              job_row.top_level,
              job_row.total_experience::text AS total_experience,
              job_row.active_7d_count::text AS active_7d_count
       FROM public.admin_work_job_levels($1) AS job_row`,
      [actorUserId],
    );
  }

  /**
   * One row, always: the function answers with scalar subqueries rather than
   * a join precisely so that a deployment with no policy in force still says
   * so instead of returning nothing.
   */
  async workRewardPolicy(actorUserId: unknown): Promise<WorkPolicyRow> {
    assertUuid(actorUserId, 'actor user id');
    const row = await queryOne<WorkPolicyRow>(
      this.pool,
      `SELECT policy_row.policy_id,
              policy_row.effective_at,
              policy_row.daily_cap::text AS daily_cap,
              policy_row.weekly_cap::text AS weekly_cap,
              policy_row.repeat_decay_percent,
              policy_row.enabled,
              policy_row.reason,
              policy_row.active_task_count::text AS active_task_count,
              policy_row.open_assignment_count::text AS open_assignment_count,
              policy_row.awaiting_verification_count::text AS awaiting_verification_count,
              policy_row.paid_24h::text AS paid_24h,
              policy_row.members_paid_24h::text AS members_paid_24h,
              policy_row.experience_24h::text AS experience_24h
       FROM public.admin_work_reward_policy($1) AS policy_row`,
      [actorUserId],
    );
    if (!row) throw new Error('admin_work_reward_policy did not return a row');
    return row;
  }

  async bankOverview(actorUserId: unknown): Promise<BankOverviewRow> {
    assertUuid(actorUserId, 'actor user id');
    const row = await queryOne<BankOverviewRow>(
      this.pool,
      `SELECT bank_row.deposit_amount::text AS deposit_amount,
              bank_row.depositor_count::text AS depositor_count,
              bank_row.open_loan_count::text AS open_loan_count,
              bank_row.outstanding_amount::text AS outstanding_amount,
              bank_row.overdue_loan_count::text AS overdue_loan_count,
              bank_row.overdue_amount::text AS overdue_amount,
              bank_row.maturing_7d_count::text AS maturing_7d_count,
              bank_row.issued_24h_count::text AS issued_24h_count,
              bank_row.issued_24h_amount::text AS issued_24h_amount,
              bank_row.repaid_24h_amount::text AS repaid_24h_amount,
              bank_row.borrower_count::text AS borrower_count
       FROM public.admin_bank_overview($1) AS bank_row`,
      [actorUserId],
    );
    if (!row) throw new Error('admin_bank_overview did not return a row');
    return row;
  }

  creditGrades(actorUserId: unknown): Promise<CreditGradeRow[]> {
    assertUuid(actorUserId, 'actor user id');
    return queryRows<CreditGradeRow>(
      this.pool,
      `SELECT grade_row.grade,
              grade_row.minimum_account_days,
              grade_row.minimum_work_completions,
              grade_row.credit_limit::text AS credit_limit,
              grade_row.interest_bps,
              grade_row.term_days,
              grade_row.minimum_repayment::text AS minimum_repayment,
              grade_row.active,
              grade_row.open_loan_count::text AS open_loan_count,
              grade_row.outstanding_amount::text AS outstanding_amount,
              grade_row.overdue_loan_count::text AS overdue_loan_count,
              grade_row.issued_loan_count::text AS issued_loan_count,
              grade_row.issued_principal::text AS issued_principal
       FROM public.admin_credit_grades($1) AS grade_row`,
      [actorUserId],
    );
  }

  loanBook(actorUserId: unknown, limit: unknown = 50): Promise<LoanBookRow[]> {
    assertUuid(actorUserId, 'actor user id');
    assertLoanLimit(limit);
    return queryRows<LoanBookRow>(
      this.pool,
      `SELECT loan_row.loan_id::text AS loan_id,
              loan_row.user_id::text AS user_id,
              loan_row.display_name,
              loan_row.credit_grade,
              loan_row.status,
              loan_row.principal_amount::text AS principal_amount,
              loan_row.interest_amount::text AS interest_amount,
              loan_row.outstanding_amount::text AS outstanding_amount,
              loan_row.repaid_amount::text AS repaid_amount,
              loan_row.minimum_repayment::text AS minimum_repayment,
              loan_row.issued_at,
              loan_row.maturity_at,
              loan_row.overdue_at,
              loan_row.status_reason
       FROM public.admin_loan_book($1, $2) AS loan_row`,
      [actorUserId, limit],
    );
  }

  async outboxHealth(actorUserId: unknown): Promise<OutboxHealthRow> {
    assertUuid(actorUserId, 'actor user id');
    const row = await queryOne<OutboxHealthRow>(
      this.pool,
      `SELECT outbox_row.pending_count::text AS pending_count,
              outbox_row.retry_pending_count::text AS retry_pending_count,
              outbox_row.delivering_count::text AS delivering_count,
              outbox_row.delivered_count::text AS delivered_count,
              outbox_row.dead_letter_count::text AS dead_letter_count,
              outbox_row.suppressed_count::text AS suppressed_count,
              outbox_row.delivered_24h_count::text AS delivered_24h_count,
              outbox_row.stuck_count::text AS stuck_count,
              outbox_row.oldest_undelivered_at,
              outbox_row.last_delivered_at,
              outbox_row.last_failure_at,
              outbox_row.unrouted_type_count::text AS unrouted_type_count
       FROM public.admin_discord_outbox_health($1) AS outbox_row`,
      [actorUserId],
    );
    if (!row) throw new Error('admin_discord_outbox_health did not return a row');
    return row;
  }

  discordRoutes(actorUserId: unknown): Promise<DiscordRouteRow[]> {
    assertUuid(actorUserId, 'actor user id');
    return queryRows<DiscordRouteRow>(
      this.pool,
      `SELECT route_row.event_type,
              route_row.channel_key,
              route_row.enabled,
              route_row.note,
              route_row.routed,
              route_row.total_count::text AS total_count,
              route_row.pending_count::text AS pending_count,
              route_row.dead_letter_count::text AS dead_letter_count,
              route_row.suppressed_count::text AS suppressed_count,
              route_row.delivered_24h_count::text AS delivered_24h_count,
              route_row.last_delivered_at
       FROM public.admin_discord_routes($1) AS route_row`,
      [actorUserId],
    );
  }
}
