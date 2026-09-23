import type { Locale } from '@/lib/locale';

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
  readonly reward_preview: string | null;
  readonly experience_preview: string | null;
  readonly recommended: boolean;
  readonly policy_version?: string;
  readonly expected_work_seconds?: number;
  readonly eligible_submit_at?: string;
  readonly settlement_mode?: 'ACTIVE' | 'ASYNC' | 'VERIFY' | 'BATCH';
  readonly repeat_factor?: string;
  readonly issuance_factor?: string;
  readonly net_reward?: string;
  readonly reason_codes?: readonly string[];
}
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

export interface WorkSummary {
  readonly daily_paid: string;
  readonly daily_cap: string;
  readonly weekly_paid: string;
  readonly weekly_cap: string;
  readonly active_assignments: string;
  readonly game_day_key: string;
  readonly game_week_key: string;
  readonly day_ends_at: string;
  readonly week_ends_at: string;
}

export interface ActiveJobProgress {
  readonly job_type: string | null;
  readonly level: number;
  readonly experience: number;
  readonly next_level_exp: number;
  readonly selected_at: string | null;
}

export interface JobMasteryItem {
  readonly job_type: string;
  readonly level: number;
  readonly experience: number;
  readonly next_level_exp: number;
  readonly is_active: boolean;
}

export interface JobProfileResponse {
  readonly active_job: ActiveJobProgress;
  readonly all_jobs: readonly JobMasteryItem[];
}

export interface JobMeta {
  readonly code: string;
  readonly name: string;
  readonly enName?: string;
  readonly icon: string;
  readonly roleDescription: string;
  readonly enRoleDescription?: string;
  readonly colorClass: string;
}

export const CAREER_JOBS: readonly JobMeta[] = [
  {
    code: 'developer',
    name: '소프트웨어 개발자',
    enName: 'Software Developer',
    icon: '💻',
    roleDescription: '알고리즘 및 시스템 구축, WLD 트랜잭션 최적화 엔진 개발',
    enRoleDescription: 'Build algorithms, systems, and optimize WLD transaction engines',
    colorClass: 'border-blue-300 text-blue-800 bg-blue-50 dark:border-blue-800 dark:text-blue-200 dark:bg-blue-950/50',
  },
  {
    code: 'trader',
    name: '전문 트레이더',
    enName: 'Professional Trader',
    icon: '📈',
    roleDescription: '시장 호가 분석, 차익 거래 및 유동성 공급',
    enRoleDescription: 'Analyze market quotes, arbitrage trading, and provide liquidity',
    colorClass: 'border-emerald-300 text-emerald-800 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-200 dark:bg-emerald-950/50',
  },
  {
    code: 'entertainer',
    name: '엔터테이너',
    enName: 'Entertainer',
    icon: '🎭',
    roleDescription: '커뮤니티 콘텐츠 제작, 방송 및 소셜 이벤트 활성화',
    enRoleDescription: 'Produce community content, live streaming, and social events',
    colorClass: 'border-purple-300 text-purple-800 bg-purple-50 dark:border-purple-800 dark:text-purple-200 dark:bg-purple-950/50',
  },
  {
    code: 'detective',
    name: '경제 탐정',
    enName: 'Financial Detective',
    icon: '🔍',
    roleDescription: '이상 거래 탐지, 자금 세탁 및 시장 부정행위 조사',
    enRoleDescription: 'Detect anomalies, investigate money laundering & market abuse',
    colorClass: 'border-amber-300 text-amber-800 bg-amber-50 dark:border-amber-800 dark:text-amber-200 dark:bg-amber-950/50',
  },
  {
    code: 'miner',
    name: '자원 채굴사',
    enName: 'Resource Miner',
    icon: '⛏️',
    roleDescription: '지하 희귀 광물 탐사 및 가상 원자재 채굴',
    enRoleDescription: 'Explore subterranean rare minerals and mine raw resources',
    colorClass: 'border-orange-300 text-orange-800 bg-orange-50 dark:border-orange-800 dark:text-orange-200 dark:bg-orange-950/50',
  },
  {
    code: 'farmer',
    name: '스마트 농부',
    enName: 'Smart Farmer',
    icon: '🌾',
    roleDescription: '친환경 작물 재배 및 유기농 식량 생산 공급망 운영',
    enRoleDescription: 'Cultivate eco-friendly crops and operate organic food chains',
    colorClass: 'border-green-300 text-green-800 bg-green-50 dark:border-green-800 dark:text-green-200 dark:bg-green-950/50',
  },
  {
    code: 'artisan',
    name: '명품 장인',
    enName: 'Master Artisan',
    icon: '⚒️',
    roleDescription: '고급 장비 제작, 희귀 인테리어 소품 및 예술품 세공',
    enRoleDescription: 'Craft premium gear, rare interior props, and fine artwork',
    colorClass: 'border-rose-300 text-rose-800 bg-rose-50 dark:border-rose-800 dark:text-rose-200 dark:bg-rose-950/50',
  },
  {
    code: 'civil_servant',
    name: '행정 공무원',
    enName: 'Civil Servant',
    icon: '🏛️',
    roleDescription: '도시 공공 서비스 집행, 복지 분배 및 규제 감사',
    enRoleDescription: 'Administer civic public services, welfare grants, and audits',
    colorClass: 'border-cyan-300 text-cyan-800 bg-cyan-50 dark:border-cyan-800 dark:text-cyan-200 dark:bg-cyan-950/50',
  },
];

const JOB_LABELS: Readonly<Record<string, { ko: string; en: string }>> = {
  developer: { ko: '소프트웨어 개발자', en: 'Software Developer' },
  trader: { ko: '전문 트레이더', en: 'Professional Trader' },
  entertainer: { ko: '엔터테이너', en: 'Entertainer' },
  detective: { ko: '경제 탐정', en: 'Financial Detective' },
  miner: { ko: '자원 채굴사', en: 'Resource Miner' },
  farmer: { ko: '농부', en: 'Smart Farmer' },
  artisan: { ko: '명품 장인', en: 'Master Artisan' },
  civil_servant: { ko: '행정 공무원', en: 'Civil Servant' },
  carrier: { ko: '운반원', en: 'Carrier' },
  technician: { ko: '기술자', en: 'Technician' },
  merchant: { ko: '상인', en: 'Merchant' },
};

export function jobLabel(code: string, locale?: Locale | unknown): string {
  const match = JOB_LABELS[code];
  if (!match) return code;
  return locale === 'en' ? match.en : match.ko;
}

export function jobMeta(code: string, locale?: Locale | unknown): JobMeta | undefined {
  const item = CAREER_JOBS.find((j) => j.code === code);
  if (!item) return undefined;
  if (locale === 'en') {
    return {
      ...item,
      name: item.enName ?? item.name,
      roleDescription: item.enRoleDescription ?? item.roleDescription,
    };
  }
  return item;
}

const DIFFICULTY_LABELS: readonly { ko: string; en: string }[] = [
  { ko: '', en: '' },
  { ko: '아주 쉬움', en: 'Very Easy' },
  { ko: '쉬움', en: 'Easy' },
  { ko: '보통', en: 'Normal' },
  { ko: '어려움', en: 'Hard' },
  { ko: '아주 어려움', en: 'Very Hard' },
];

export function difficultyLabel(level: number, locale?: Locale | unknown): string {
  const match = DIFFICULTY_LABELS[level];
  if (!match) return locale === 'en' ? `Tier ${level}` : `${level}단계`;
  return locale === 'en' ? match.en : match.ko;
}

const STATUS_LABELS: Readonly<Record<string, { ko: string; en: string }>> = {
  assigned: { ko: '진행 중', en: 'In Progress' },
  submitted: { ko: '제출함', en: 'Submitted' },
  approved: { ko: '지급 완료', en: 'Rewarded' },
  rejected: { ko: '거절됨', en: 'Rejected' },
  expired: { ko: '기한 지남', en: 'Expired' },
};

export function statusLabel(status: string, locale?: Locale | unknown): string {
  const match = STATUS_LABELS[status];
  if (!match) return status;
  return locale === 'en' ? match.en : match.ko;
}

export function isOpen(assignment: WorkAssignment): boolean {
  return assignment.status === 'assigned' || assignment.status === 'submitted';
}

export function durationLabel(seconds: number, locale?: Locale | unknown): string {
  if (locale === 'en') {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const restSeconds = seconds % 60;
    if (minutes < 60) return restSeconds === 0 ? `${minutes}m` : `${minutes}m ${restSeconds}s`;
    const hours = Math.floor(minutes / 60);
    const restMinutes = minutes % 60;
    if (restMinutes === 0 && restSeconds === 0) return `${hours}h`;
    const minutePart = restMinutes === 0 ? '' : ` ${restMinutes}m`;
    const secondPart = restSeconds === 0 ? '' : ` ${restSeconds}s`;
    return `${hours}h${minutePart}${secondPart}`;
  }

  if (seconds < 60) return `${seconds}초`;
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;
  if (minutes < 60) return restSeconds === 0 ? `${minutes}분` : `${minutes}분 ${restSeconds}초`;
  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;
  if (restMinutes === 0 && restSeconds === 0) return `${hours}시간`;
  const minutePart = restMinutes === 0 ? '' : ` ${restMinutes}분`;
  const secondPart = restSeconds === 0 ? '' : ` ${restSeconds}초`;
  return `${hours}시간${minutePart}${secondPart}`;
}

export function secondsUntilSubmittable(
  assignedAt: string,
  minimumDurationSeconds: number,
  now: number,
): number {
  const ready = Date.parse(assignedAt) + minimumDurationSeconds * 1000;
  if (!Number.isFinite(ready)) return 0;
  return Math.max(0, Math.ceil((ready - now) / 1000));
}

export function hasExpired(expiresAt: string, now: number): boolean {
  const at = Date.parse(expiresAt);
  return Number.isFinite(at) && at <= now;
}

export function remaining(paid: string, cap: string): string {
  if (!/^\d+$/.test(paid) || !/^\d+$/.test(cap)) return '0';
  const left = BigInt(cap) - BigInt(paid);
  return left > 0n ? left.toString() : '0';
}

export type WorkQuotaBlock = 'daily' | 'weekly';
export type WorkTaskBlock = WorkQuotaBlock | 'task_daily' | null;

export function quotaReached(paid: string, cap: string): boolean {
  if (!/^\d+$/.test(paid) || !/^\d+$/.test(cap)) return false;
  const limit = BigInt(cap);
  return limit > 0n && BigInt(paid) >= limit;
}

export function workQuotaBlock(summary: WorkSummary | null | undefined): WorkQuotaBlock | null {
  if (!summary) return null;
  if (quotaReached(summary.daily_paid, summary.daily_cap)) return 'daily';
  if (quotaReached(summary.weekly_paid, summary.weekly_cap)) return 'weekly';
  return null;
}

export function workTaskBlock(task: WorkTask, quotaBlock: WorkQuotaBlock | null): WorkTaskBlock {
  if (quotaBlock) return quotaBlock;
  return task.daily_limit > 0 && task.taken_today >= task.daily_limit ? 'task_daily' : null;
}

export function progressPercent(paid: string, cap: string): number {
  if (!/^\d+$/.test(paid) || !/^\d+$/.test(cap)) return 0;
  const total = BigInt(cap);
  if (total <= 0n) return 0;
  const done = BigInt(paid);
  const rounded = (done * 100n + total / 2n) / total;
  return Math.min(100, Math.max(0, Number(rounded)));
}

export function rewardSentence(task: WorkTask, locale?: Locale | unknown): string {
  if (task.reward_preview === null || task.experience_preview === null) {
    return locale === 'en'
      ? 'Career work rewards are temporarily paused.'
      : '현재 직업 업무 보상 지급이 일시 중지되어 있어요.';
  }
  const levelBonus =
    task.reward_preview !== task.base_reward || task.experience_preview !== task.base_experience;
  if (locale === 'en') {
    return levelBonus
      ? `Complete now to earn ${task.reward_preview} WLD and ${task.experience_preview} EXP, including your career-level bonus.`
      : `Complete now to earn ${task.reward_preview} WLD and ${task.experience_preview} EXP.`;
  }
  return levelBonus
    ? `지금 마치면 직업 레벨 보너스를 포함해 ${task.reward_preview} WLD와 ${task.experience_preview} EXP를 받아요.`
    : `지금 마치면 ${task.reward_preview} WLD와 ${task.experience_preview} EXP를 받아요.`;
}

export function isSpent(_task: WorkTask): boolean {
  return false;
}

export function boardOrder(
  tasks: readonly WorkTask[],
  activeJobType?: string | null,
): readonly WorkTask[] {
  return [...tasks].sort((left, right) => {
    // 1. If activeJobType is provided, prioritize active job tasks at the very top
    if (activeJobType) {
      const leftIsActive = left.job_type === activeJobType;
      const rightIsActive = right.job_type === activeJobType;
      if (leftIsActive !== rightIsActive) {
        return leftIsActive ? -1 : 1;
      }
    }

    // 2. Recommended tasks
    if (left.recommended !== right.recommended) {
      return Number(right.recommended) - Number(left.recommended);
    }

    // 3. Difficulty ascending
    if (left.difficulty !== right.difficulty) {
      return left.difficulty - right.difficulty;
    }

    return left.code.localeCompare(right.code);
  });
}
