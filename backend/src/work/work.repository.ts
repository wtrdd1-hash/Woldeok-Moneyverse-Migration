import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class WorkInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkInputError';
  }
}

function assertUuid(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || !UUID.test(value)) {
    throw new WorkInputError(`${field} must be a UUID`);
  }
}

export type WorkFeatureState = 'enabled' | 'paused' | 'safe_mode' | 'disabled';

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

export interface WorkTaskRow {
  task_id: string;
  code: string;
  name: string;
  description: string;
  job_type: string;
  difficulty: number;
  base_reward: string;
  base_experience: string;
  minimum_duration_seconds: number;
  daily_limit: number;
  taken_today: number;
  reward_preview: string | null;
  experience_preview: string | null;
  recommended: boolean;
  policy_version?: string;
  expected_work_seconds?: number;
  eligible_submit_at?: string;
  settlement_mode?: 'ACTIVE' | 'ASYNC' | 'VERIFY' | 'BATCH';
  repeat_factor?: string;
  issuance_factor?: string;
  net_reward?: string;
  reason_codes?: string[];
}

export interface WorkReceiptRow {
  receipt_id: string;
  assignment_id: string;
  code: string;
  name: string;
  reward_amount: string;
  experience_amount: string;
  transaction_id: string | null;
  created_at: Date;
}

export interface WorkDashboardRow {
  daily_paid: string;
  daily_cap: string;
  weekly_paid: string;
  weekly_cap: string;
  active_assignments: string;
  game_day_key: string;
  game_week_key: string;
  day_ends_at: Date;
  week_ends_at: Date;
}

export interface WorkCompleteV2Row {
  reward_amount: string;
  experience_gained: string;
  current_level: number;
  current_experience: string;
  level_up: boolean;
  transaction_id: string;
}

interface JobProfileItem {
  readonly job_type?: string;
  readonly level?: number;
  readonly experience?: number;
  readonly next_level_exp?: number;
  readonly is_active?: boolean;
  mastery_tier?: ReturnType<typeof computeMasteryTier>;
  readonly [key: string]: unknown;
}

interface JobProfilePayload {
  active_job?: JobProfileItem | null;
  all_jobs?: JobProfileItem[];
  qualifications?: unknown[];
  readonly [key: string]: unknown;
}

export class WorkRepository {
  private cachedFeatureState: { readonly state: WorkFeatureState; readonly cachedUntil: number } | null = null;

  constructor(private readonly pool: Queryable) {}

  invalidateFeatureStateCache(): void {
    this.cachedFeatureState = null;
  }

  async featureState(): Promise<WorkFeatureState> {
    const now = Date.now();
    if (this.cachedFeatureState && this.cachedFeatureState.cachedUntil > now) {
      return this.cachedFeatureState.state;
    }
    const row = await queryOne<{ state: WorkFeatureState }>(
      this.pool,
      `SELECT public.feature_switch_state('work')::text AS state`,
    );
    const state = row?.state ?? 'disabled';
    this.cachedFeatureState = { state, cachedUntil: now + 30_000 };
    return state;
  }

  private async requireEnabled(): Promise<void> {
    const state = await this.featureState();
    if (state !== 'enabled') throw new WorkInputError(`work feature is ${state}`);
  }

  private async requireExistingFlowAllowed(): Promise<void> {
    const state = await this.featureState();
    if (state === 'disabled') throw new WorkInputError('work feature is disabled');
  }

  async assign(key: unknown, actor: unknown, task: unknown): Promise<WorkAssignmentRow | null> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    assertUuid(task, 'task id');
    await this.requireEnabled();
    return queryOne<WorkAssignmentRow>(
      this.pool,
      `SELECT assignment.assignment_id::text, assignment.task_id::text,
              assignment.assigned_at, assignment.expires_at, assignment.replayed
       FROM public.work_assign_task($1, $2, $3) AS assignment`,
      [key, actor, task],
    );
  }

  async submit(
    key: unknown,
    actor: unknown,
    assignment: unknown,
    evidence?: string,
  ): Promise<WorkCompletionRow | null> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    assertUuid(assignment, 'assignment id');
    await this.requireExistingFlowAllowed();
    return queryOne<WorkCompletionRow>(
      this.pool,
      `SELECT completion.assignment_id::text, completion.submitted_at, completion.replayed
       FROM public.work_submit_completion($1, $2, $3, $4) AS completion`,
      [key, actor, assignment, evidence ?? null],
    );
  }

  async verify(key: unknown, actor: unknown, assignment: unknown): Promise<WorkRewardRow | null> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    assertUuid(assignment, 'assignment id');
    await this.requireExistingFlowAllowed();
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
              summary.active_assignments::text,
              summary.game_day_key::text, summary.game_week_key::text,
              summary.day_ends_at, summary.week_ends_at
       FROM public.work_my_dashboard_v2($1) AS summary`,
      [actor],
    );
  }

  async tasks(actor: unknown): Promise<WorkTaskRow[]> {
    assertUuid(actor, 'actor');
    const rows = await queryRows<WorkTaskRow>(
      this.pool,
      `SELECT task.task_id::text, task.code, task.name, task.description,
              task.job_type::text, task.difficulty, task.base_reward::text,
              task.base_experience::text, task.minimum_duration_seconds,
              task.daily_limit, task.taken_today, task.reward_preview::text,
              public.work_experience_preview($1, task.task_id)::text AS experience_preview,
              task.recommended
       FROM public.work_task_board($1) AS task`,
      [actor],
    );
    const now = Date.now();
    return rows.map((task) => {
      const expectedSeconds =
        task.minimum_duration_seconds > 0
          ? task.minimum_duration_seconds
          : Math.max(30, (task.difficulty || 1) * 30);
      const eligibleSubmitAt = new Date(now + expectedSeconds * 1000).toISOString();
      const takenToday = Number(task.taken_today) || 0;
      const repeatFactorNum = Math.max(0.2, 1.0 - takenToday * 0.15);
      const repeatFactor = repeatFactorNum.toFixed(4);
      const issuanceFactor = '1.0000';
      const effectiveBase = parseFloat(task.reward_preview || task.base_reward) || 0;
      const netReward = String(Math.round(effectiveBase * repeatFactorNum * parseFloat(issuanceFactor)));
      const reasonCodes: string[] = [];
      if (takenToday > 0) {
        reasonCodes.push('REPEAT_DECAY_APPLIED');
      } else {
        reasonCodes.push('OPTIMAL_REWARD');
      }
      if (task.recommended) {
        reasonCodes.push('CAREER_AFFINITY_BONUS');
      }
      return {
        ...task,
        policy_version: 'v2026.09.23.401',
        expected_work_seconds: expectedSeconds,
        eligible_submit_at: eligibleSubmitAt,
        settlement_mode: 'ACTIVE' as const,
        repeat_factor: repeatFactor,
        issuance_factor: issuanceFactor,
        net_reward: netReward,
        reason_codes: reasonCodes,
      };
    });
  }

  receipts(actor: unknown): Promise<WorkReceiptRow[]> {
    assertUuid(actor, 'actor');
    return queryRows<WorkReceiptRow>(
      this.pool,
      `SELECT receipt.receipt_id::text, receipt.assignment_id::text, receipt.code,
              receipt.name, receipt.reward_amount::text, receipt.experience_amount::text,
              receipt.transaction_id::text, receipt.created_at
       FROM public.work_my_receipts($1) AS receipt`,
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

  async jobProfile(actor: unknown): Promise<unknown> {
    assertUuid(actor, 'actor');
    const row = await queryOne<{ profile: any }>(
      this.pool,
      `SELECT public.job_get_my_profile($1) AS profile`,
      [actor],
    );
    if (!row?.profile) return null;

    const profile = row.profile;
    if (profile.active_job && profile.active_job.level) {
      profile.active_job.mastery_tier = computeMasteryTier(profile.active_job.level);
    }
    if (Array.isArray(profile.all_jobs)) {
      profile.all_jobs = profile.all_jobs.map((j: any) => ({
        ...j,
        mastery_tier: computeMasteryTier(j.level ?? 1),
      }));
    }

    // Attach acquired qualifications
    const quals = await queryRows<{
      id: string;
      job_type: string;
      qualification_code: string;
      title: string;
      tier: string;
      fee_wld: string;
      acquired_at: string;
    }>(
      this.pool,
      `SELECT id::text, job_type::text, qualification_code, title, tier,
              fee_wld::text, acquired_at::text
       FROM public.user_job_qualifications
       WHERE user_id = $1
       ORDER BY acquired_at ASC`,
      [actor],
    );
    profile.qualifications = quals;

    return profile;
  }

  async listQualifications(actor: unknown, jobType?: string) {
    assertUuid(actor, 'actor');
    let sql = `
      SELECT id::text, job_type::text, qualification_code, title, tier,
             fee_wld::text, acquired_at::text
      FROM public.user_job_qualifications
      WHERE user_id = $1
    `;
    const params: unknown[] = [actor];
    if (jobType) {
      sql += ` AND job_type = $2::public.work_job_type`;
      params.push(jobType);
    }
    sql += ` ORDER BY acquired_at ASC`;
    const acquired = await queryRows<{
      id: string;
      job_type: string;
      qualification_code: string;
      title: string;
      tier: string;
      fee_wld: string;
      acquired_at: string;
    }>(this.pool, sql, params);

    return {
      authoritative_catalog: AUTHORITATIVE_QUALIFICATIONS.map((q) => ({
        code: q.code,
        title: q.title,
        title_ko: q.titleKo,
        tier: q.tier,
        tier_ko: q.tierKo,
        min_level: q.minLevel,
        fee_wld: q.feeWld.toString(),
        description_ko: q.descriptionKo,
      })),
      acquired,
    };
  }

  async certifyQualification(actor: unknown, jobType: string, qualificationCode: string) {
    assertUuid(actor, 'actor');
    await this.requireEnabled();
    try {
      const res = await queryOne<{ result: any }>(
        this.pool,
        `SELECT public.job_certify_qualification($1, $2, $3) AS result`,
        [actor, jobType, qualificationCode],
      );
      return res?.result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new WorkInputError(msg);
    }
  }

  async switchActiveJob(actor: unknown, jobType: string): Promise<unknown> {
    assertUuid(actor, 'actor');
    await this.requireEnabled();
    return queryOne(
      this.pool,
      `SELECT job_type::text, level, experience::text AS current_experience, is_active
       FROM public.job_switch_active($1, $2::text)`,
      [actor, jobType],
    );
  }

  async completeTaskV2(
    key: unknown,
    actor: unknown,
    taskId: unknown,
  ): Promise<WorkCompleteV2Row | null> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    assertUuid(taskId, 'task id');
    await this.requireEnabled();
    return queryOne<WorkCompleteV2Row>(
      this.pool,
      `SELECT reward_amount::text, experience_gained::text, current_level,
              current_experience::text, level_up, transaction_id::text
       FROM public.work_complete_task_v2($1, $2, $3)`,
      [actor, taskId, key],
    );
  }
}

export interface QualificationSpec {
  readonly code: string;
  readonly title: string;
  readonly titleKo: string;
  readonly tier: string;
  readonly tierKo: string;
  readonly minLevel: number;
  readonly feeWld: bigint;
  readonly descriptionKo: string;
}

export const AUTHORITATIVE_QUALIFICATIONS: readonly QualificationSpec[] = [
  {
    code: 'UNIFORM_STYLING',
    title: 'Uniform Styling Certification',
    titleKo: '공식 유니폼 커스텀 스타일링 자격',
    tier: 'APPRENTICE',
    tierKo: '견습',
    minLevel: 1,
    feeWld: BigInt(500),
    descriptionKo: '직업별 고유 유니폼 및 작업복 외형 커스텀 스타일링 자격',
  },
  {
    code: 'BASIC_LICENSE',
    title: 'Standard Career License',
    titleKo: '공인 기본 직업 면허',
    tier: 'JOURNEYMAN',
    tierKo: '숙련',
    minLevel: 3,
    feeWld: BigInt(750),
    descriptionKo: '기본 직무 능력을 공식 인증받아 공공 및 상위 작업 참여 자격을 획득',
  },
  {
    code: 'BADGE_ENGRAVING',
    title: 'Mastery Badge Engraving',
    titleKo: '숙련 직업배지 각인 권한',
    tier: 'JOURNEYMAN',
    tierKo: '숙련',
    minLevel: 5,
    feeWld: BigInt(1500),
    descriptionKo: '회원 프로필 및 작업 보드에 골드 각인 직업 배지를 영구 전시',
  },
  {
    code: 'SPECIALIST_CERTIFICATE',
    title: 'Specialist Professional Certificate',
    titleKo: '전문가 공인 자격증서',
    tier: 'PROFESSIONAL',
    tierKo: '프로',
    minLevel: 10,
    feeWld: BigInt(5000),
    descriptionKo: '상위 정체성 전문 칭호를 부여받고 고난도 전문 과제 우선 배정 자격 획득',
  },
  {
    code: 'MASTER_PORTFOLIO',
    title: 'Master Portfolio Archive',
    titleKo: '마스터 명예 포트폴리오 심사',
    tier: 'SPECIALIST',
    tierKo: '전문가',
    minLevel: 25,
    feeWld: BigInt(25000),
    descriptionKo: '중앙 국고 및 명예의 전당에 커리어 기록을 영구 아카이빙하는 최고 명예',
  },
];

export function computeMasteryTier(level: number): {
  readonly code: 'APPRENTICE' | 'JOURNEYMAN' | 'PROFESSIONAL' | 'SPECIALIST' | 'EXPERT' | 'MASTER' | 'LEGACY';
  readonly nameKo: string;
  readonly nameEn: string;
} {
  if (level >= 50) return { code: 'LEGACY', nameKo: '레거시 명예', nameEn: 'Legacy Grandmaster' };
  if (level >= 40) return { code: 'MASTER', nameKo: '마스터', nameEn: 'Master' };
  if (level >= 30) return { code: 'EXPERT', nameKo: '엑스퍼트', nameEn: 'Expert' };
  if (level >= 20) return { code: 'SPECIALIST', nameKo: '전문가', nameEn: 'Specialist' };
  if (level >= 10) return { code: 'PROFESSIONAL', nameKo: '프로', nameEn: 'Professional' };
  if (level >= 5) return { code: 'JOURNEYMAN', nameKo: '숙련', nameEn: 'Journeyman' };
  return { code: 'APPRENTICE', nameKo: '견습', nameEn: 'Apprentice' };
}

