import { Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

export class OperationsInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OperationsInputError';
  }
}

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
  readonly last_assigned_at: string | null;
}

export interface WorkPolicyRow {
  readonly policy_id: number | null;
  readonly effective_at: string | null;
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

export interface WorkJobRankingRow {
  readonly job_type: string;
  readonly rank: number;
  readonly completions_24h: number;
  readonly members_24h: number;
  readonly total_paid_24h: string;
  readonly total_exp_24h: string;
  readonly share_percentage: number;
}

export interface WorkDailyCapBucket {
  readonly bucket: string;
  readonly label: string;
  readonly user_count: number;
  readonly percentage: number;
}

export interface WorkTrendDay {
  readonly date: string;
  readonly count: number;
  readonly total_paid: string;
}

export interface WorkRealtimeStats {
  readonly rankings: readonly WorkJobRankingRow[];
  readonly total_completions_24h: number;
  readonly total_paid_24h: string;
  readonly total_members_24h: number;
  readonly current_daily_cap: string | null;
  readonly capped_users_count: number;
  readonly average_cap_usage_percent: number;
  readonly economy_health_status: 'stable' | 'active' | 'overheated' | 'cooling';
  readonly recommended_daily_cap: number;
  readonly recommended_decay_percent: number;
  readonly cap_buckets: readonly WorkDailyCapBucket[];
  readonly trend_7d: readonly WorkTrendDay[];
}

export interface JobLevelRow {
  readonly job_type: string;
  readonly member_count: string;
  readonly average_level: string;
  readonly top_level: number;
  readonly total_experience: string;
  readonly active_7d_count: string;
}

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
  readonly issued_at: string;
  readonly maturity_at: string;
  readonly overdue_at: string | null;
  readonly status_reason: string | null;
}

export interface OutboxHealthRow {
  readonly pending_count: string;
  readonly retry_pending_count: string;
  readonly delivering_count: string;
  readonly delivered_count: string;
  readonly dead_letter_count: string;
  readonly suppressed_count: string;
  readonly delivered_24h_count: string;
  readonly stuck_count: string;
  readonly oldest_undelivered_at: string | null;
  readonly last_delivered_at: string | null;
  readonly last_failure_at: string | null;
  readonly unrouted_type_count: string;
}

export interface DiscordRouteRow {
  readonly event_type: string;
  readonly channel_key: string;
  readonly enabled: boolean;
  readonly note: string | null;
  readonly routed: boolean;
  readonly total_count: string;
  readonly pending_count: string;
  readonly dead_letter_count: string;
  readonly suppressed_count: string;
  readonly delivered_24h_count: string;
  readonly last_delivered_at: string | null;
}

export interface ActiveStockRow {
  readonly id: string;
  readonly symbol: string;
  readonly name: string;
  readonly price: string;
  readonly active: boolean;
}

export interface UpdateWorkTaskInput {
  readonly baseReward?: number;
  readonly baseExperience?: number;
  readonly minimumDurationSeconds?: number;
  readonly dailyLimit?: number;
  readonly active?: boolean;
}

export interface UpdateWorkRewardPolicyInput {
  readonly dailyCap?: number | null;
  readonly weeklyCap?: number | null;
  readonly repeatDecayPercent?: number;
  readonly enabled?: boolean;
  readonly reason?: string;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const LOAN_LIMIT_MAX = 200;

function assertUuid(value: unknown, name: string): asserts value is string {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    throw new OperationsInputError(`invalid ${name}: expected a UUID`);
  }
}

function assertLoanLimit(value: unknown): asserts value is number {
  if (
    typeof value !== 'number' ||
    !Number.isInteger(value) ||
    value < 1 ||
    value > LOAN_LIMIT_MAX
  ) {
    throw new OperationsInputError(`limit must be an integer between 1 and ${LOAN_LIMIT_MAX}`);
  }
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
              task_row.job_type::text AS job_type,
              task_row.difficulty,
              task_row.base_reward::text AS base_reward,
              task_row.base_experience::text AS base_experience,
              task_row.minimum_duration_seconds,
              COALESCE(c.daily_limit, task_row.daily_limit, 100) AS daily_limit,
              task_row.active,
              task_row.open_assignment_count::text AS open_assignment_count,
              task_row.awaiting_verification_count::text AS awaiting_verification_count,
              task_row.approved_24h::text AS approved_24h,
              task_row.rejected_24h::text AS rejected_24h,
              task_row.paid_24h::text AS paid_24h,
              task_row.last_assigned_at
       FROM public.admin_work_catalogue($1) AS task_row
       LEFT JOIN public.work_task_catalog c ON c.id = task_row.task_id`,
      [actorUserId],
    );
  }

  jobLevels(actorUserId: unknown): Promise<JobLevelRow[]> {
    assertUuid(actorUserId, 'actor user id');
    return queryRows<JobLevelRow>(
      this.pool,
      `SELECT level_row.job_type::text AS job_type,
              level_row.member_count::text AS member_count,
              level_row.average_level::text AS average_level,
              level_row.top_level,
              level_row.total_experience::text AS total_experience,
              level_row.active_7d_count::text AS active_7d_count
       FROM public.admin_job_levels($1) AS level_row`,
      [actorUserId],
    );
  }

  async findActiveStocks(): Promise<ActiveStockRow[]> {
    return queryRows<ActiveStockRow>(
      this.pool,
      `SELECT id::text AS id, symbol, name, price::text AS price, active
       FROM public.virtual_stocks
       WHERE active = true
       ORDER BY symbol ASC`,
      [],
    );
  }

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

  /**
   * 직업별 실시간 24시간 수행 통계, 랭킹, 일일 캡 소모율 구간 분포 및 7일 트렌드 집계
   */
  async getWorkRealtimeStats(actorUserId: unknown): Promise<WorkRealtimeStats> {
    assertUuid(actorUserId, 'actor user id');

    const policy = await this.workRewardPolicy(actorUserId);
    const dailyCapNum = policy.daily_cap ? Number(policy.daily_cap) : 0;
    const effectiveCap = dailyCapNum > 0 ? dailyCapNum : 5000;

    const rawJobStats = await queryRows<{
      job_type: string;
      completions_24h: number;
      members_24h: number;
      total_paid_24h: string;
      total_exp_24h: string;
    }>(
      this.pool,
      `WITH recent_rewards AS (
         SELECT a.task_id, r.user_id, r.reward_amount, r.experience_amount
         FROM public.work_reward_receipts r
         JOIN public.work_assignments a ON a.id = r.assignment_id
         WHERE r.created_at >= now() - interval '24 hours'
       )
       SELECT
         t.job_type::text AS job_type,
         COALESCE(count(rr.task_id), 0)::int AS completions_24h,
         COALESCE(count(DISTINCT rr.user_id), 0)::int AS members_24h,
         COALESCE(sum(rr.reward_amount), 0)::text AS total_paid_24h,
         COALESCE(sum(rr.experience_amount), 0)::text AS total_exp_24h
       FROM public.work_task_catalog t
       LEFT JOIN recent_rewards rr ON rr.task_id = t.id
       GROUP BY t.job_type
       ORDER BY completions_24h DESC, total_paid_24h DESC`,
      [],
    );

    const totalCompletions = rawJobStats.reduce((acc, j) => acc + j.completions_24h, 0);
    const totalPaidBigInt = rawJobStats.reduce((acc, j) => acc + BigInt(j.total_paid_24h), 0n);

    const allJobs = ['farmer', 'miner', 'carrier', 'technician', 'merchant'];
    const jobMap = new Map(rawJobStats.map((s) => [s.job_type, s]));

    const mergedJobs = allJobs.map((job) => {
      const found = jobMap.get(job);
      return {
        job_type: job,
        completions_24h: found ? found.completions_24h : 0,
        members_24h: found ? found.members_24h : 0,
        total_paid_24h: found ? found.total_paid_24h : '0',
        total_exp_24h: found ? found.total_exp_24h : '0',
      };
    }).sort((a, b) => b.completions_24h - a.completions_24h);

    const rankings: WorkJobRankingRow[] = mergedJobs.map((j, idx) => ({
      job_type: j.job_type,
      rank: idx + 1,
      completions_24h: j.completions_24h,
      members_24h: j.members_24h,
      total_paid_24h: j.total_paid_24h,
      total_exp_24h: j.total_exp_24h,
      share_percentage: totalCompletions > 0 ? Math.round((j.completions_24h / totalCompletions) * 1000) / 10 : 0,
    }));

    const userPayouts = await queryRows<{
      user_id: string;
      user_paid_24h: string;
    }>(
      this.pool,
      `SELECT r.user_id::text AS user_id, sum(r.reward_amount)::text AS user_paid_24h
       FROM public.work_reward_receipts r
       WHERE r.created_at >= now() - interval '24 hours'
       GROUP BY r.user_id`,
      [],
    );

    let b0 = 0;
    let b25 = 0;
    let b50 = 0;
    let b75 = 0;
    let b100 = 0;
    let totalUsagePercent = 0;

    for (const u of userPayouts) {
      const amount = Number(u.user_paid_24h);
      const ratio = (amount / effectiveCap) * 100;
      totalUsagePercent += Math.min(ratio, 100);

      if (ratio >= 100) b100 += 1;
      else if (ratio >= 75) b75 += 1;
      else if (ratio >= 50) b50 += 1;
      else if (ratio >= 25) b25 += 1;
      else b0 += 1;
    }

    const totalMembers = userPayouts.length;
    const avgUsage = totalMembers > 0 ? Math.round(totalUsagePercent / totalMembers) : 0;
    const cappedPercentage = totalMembers > 0 ? Math.round((b100 / totalMembers) * 100) : 0;

    const cap_buckets: WorkDailyCapBucket[] = [
      { bucket: '0-25', label: '0 ~ 25% (여유)', user_count: b0, percentage: totalMembers > 0 ? Math.round((b0 / totalMembers) * 100) : 0 },
      { bucket: '25-50', label: '25 ~ 50% (보통)', user_count: b25, percentage: totalMembers > 0 ? Math.round((b25 / totalMembers) * 100) : 0 },
      { bucket: '50-75', label: '50 ~ 75% (활발)', user_count: b50, percentage: totalMembers > 0 ? Math.round((b50 / totalMembers) * 100) : 0 },
      { bucket: '75-99', label: '75 ~ 99% (임계)', user_count: b75, percentage: totalMembers > 0 ? Math.round((b75 / totalMembers) * 100) : 0 },
      { bucket: '100+', label: '100% 한도 도달', user_count: b100, percentage: cappedPercentage },
    ];

    const trend_7d = await queryRows<WorkTrendDay>(
      this.pool,
      `SELECT
         to_char(d.day, 'YYYY-MM-DD') AS date,
         COALESCE(count(r.id), 0)::int AS count,
         COALESCE(sum(r.reward_amount), 0)::text AS total_paid
       FROM generate_series(
         date_trunc('day', now() - interval '6 days'),
         date_trunc('day', now()),
         interval '1 day'
       ) AS d(day)
       LEFT JOIN public.work_reward_receipts r ON date_trunc('day', r.created_at) = d.day
       GROUP BY d.day
       ORDER BY d.day ASC`,
      [],
    );

    let economy_health_status: 'stable' | 'active' | 'overheated' | 'cooling' = 'stable';
    let recommended_daily_cap = 5000;
    let recommended_decay_percent = 0;

    if (cappedPercentage >= 70 || (totalPaidBigInt > 100000n && avgUsage > 80)) {
      economy_health_status = 'overheated';
      recommended_daily_cap = 2000;
      recommended_decay_percent = 15;
    } else if (cappedPercentage >= 40 || avgUsage >= 50) {
      economy_health_status = 'active';
      recommended_daily_cap = 5000;
      recommended_decay_percent = 5;
    } else if (totalMembers < 5 || totalCompletions < 10) {
      economy_health_status = 'cooling';
      recommended_daily_cap = 10000;
      recommended_decay_percent = 0;
    } else {
      economy_health_status = 'stable';
      recommended_daily_cap = 5000;
      recommended_decay_percent = 0;
    }

    return {
      rankings,
      total_completions_24h: totalCompletions,
      total_paid_24h: totalPaidBigInt.toString(),
      total_members_24h: totalMembers,
      current_daily_cap: policy.daily_cap,
      capped_users_count: b100,
      average_cap_usage_percent: avgUsage,
      economy_health_status,
      recommended_daily_cap,
      recommended_decay_percent,
      cap_buckets,
      trend_7d,
    };
  }

  /**
   * 경제 지표 기반 1-클릭 또는 스케줄러 일일 보상 캡 & 감액률 자동 조절
   */
  async autoTuneWorkPolicy(actorUserId: unknown): Promise<{
    previous_cap: string | null;
    tuned_cap: number;
    decay_percent: number;
    status: string;
    reason: string;
  }> {
    assertUuid(actorUserId, 'actor user id');
    const stats = await this.getWorkRealtimeStats(actorUserId);

    const reason = `AI 경제 밸런싱 엔진 자동 조절 (${stats.economy_health_status.toUpperCase()} 상태, 캡도달자: ${stats.capped_users_count}명, 평균소모: ${stats.average_cap_usage_percent}%)`;

    // 1 게임주 = 7 게임일: 주간 한도가 일간 한도보다 적어지는 역전 현상을 원천 방지하기 위해 7배로 비례 산정
    const recommended_weekly_cap = stats.recommended_daily_cap * 7;

    await this.updateWorkRewardPolicy(actorUserId, {
      dailyCap: stats.recommended_daily_cap,
      weeklyCap: recommended_weekly_cap,
      repeatDecayPercent: stats.recommended_decay_percent,
      enabled: true,
      reason,
    });

    return {
      previous_cap: stats.current_daily_cap,
      tuned_cap: stats.recommended_daily_cap,
      decay_percent: stats.recommended_decay_percent,
      status: stats.economy_health_status,
      reason,
    };
  }

  async updateWorkTask(
    actorUserId: unknown,
    taskId: unknown,
    input: UpdateWorkTaskInput,
  ): Promise<WorkCatalogueRow> {
    assertUuid(actorUserId, 'actor user id');
    assertUuid(taskId, 'task id');
    const row = await queryOne<WorkCatalogueRow>(
      this.pool,
      `SELECT updated.task_id::text AS task_id,
              updated.code,
              updated.name,
              '' AS job_type,
              0 AS difficulty,
              updated.base_reward::text AS base_reward,
              updated.base_experience::text AS base_experience,
              updated.minimum_duration_seconds,
              updated.daily_limit,
              updated.active,
              '0' AS open_assignment_count,
              '0' AS awaiting_verification_count,
              '0' AS approved_24h,
              '0' AS rejected_24h,
              '0' AS paid_24h,
              updated.updated_at AS last_assigned_at
       FROM public.admin_update_work_task(
         $1, $2, $3, $4, $5, $6, $7
       ) AS updated`,
      [
        actorUserId,
        taskId,
        input.baseReward ?? null,
        input.baseExperience ?? null,
        input.minimumDurationSeconds ?? null,
        input.dailyLimit ?? null,
        input.active ?? null,
      ],
    );
    if (!row) throw new Error('admin_update_work_task did not return a row');
    return row;
  }

  async updateWorkRewardPolicy(
    actorUserId: unknown,
    input: UpdateWorkRewardPolicyInput,
  ): Promise<WorkPolicyRow> {
    assertUuid(actorUserId, 'actor user id');
    const row = await queryOne<WorkPolicyRow>(
      this.pool,
      `SELECT updated.policy_id,
              updated.effective_at,
              updated.daily_cap::text AS daily_cap,
              updated.weekly_cap::text AS weekly_cap,
              updated.repeat_decay_percent,
              updated.enabled,
              updated.reason,
              '0' AS active_task_count,
              '0' AS open_assignment_count,
              '0' AS awaiting_verification_count,
              '0' AS paid_24h,
              '0' AS members_paid_24h,
              '0' AS experience_24h
       FROM public.admin_update_work_reward_policy(
         $1, $2, $3, $4, $5, $6
       ) AS updated`,
      [
        actorUserId,
        input.dailyCap ?? null,
        input.weeklyCap ?? null,
        input.repeatDecayPercent ?? null,
        input.enabled ?? null,
        input.reason ?? null,
      ],
    );
    if (!row) throw new Error('admin_update_work_reward_policy did not return a row');
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
