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
  readonly recommended: boolean;
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
    colorClass: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
  },
  {
    code: 'trader',
    name: '전문 트레이더',
    enName: 'Professional Trader',
    icon: '📈',
    roleDescription: '시장 호가 분석, 차익 거래 및 유동성 공급',
    enRoleDescription: 'Analyze market quotes, arbitrage trading, and provide liquidity',
    colorClass: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
  },
  {
    code: 'entertainer',
    name: '엔터테이너',
    enName: 'Entertainer',
    icon: '🎭',
    roleDescription: '커뮤니티 콘텐츠 제작, 방송 및 소셜 이벤트 활성화',
    enRoleDescription: 'Produce community content, live streaming, and social events',
    colorClass: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
  },
  {
    code: 'detective',
    name: '경제 탐정',
    enName: 'Financial Detective',
    icon: '🔍',
    roleDescription: '이상 거래 탐지, 자금 세탁 및 시장 부정행위 조사',
    enRoleDescription: 'Detect anomalies, investigate money laundering & market abuse',
    colorClass: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
  },
  {
    code: 'miner',
    name: '자원 채굴사',
    enName: 'Resource Miner',
    icon: '⛏️',
    roleDescription: '지하 희귀 광물 탐사 및 가상 원자재 채굴',
    enRoleDescription: 'Explore subterranean rare minerals and mine raw resources',
    colorClass: 'border-orange-500/30 text-orange-400 bg-orange-500/10',
  },
  {
    code: 'farmer',
    name: '스마트 농부',
    enName: 'Smart Farmer',
    icon: '🌾',
    roleDescription: '친환경 작물 재배 및 유기농 식량 생산 공급망 운영',
    enRoleDescription: 'Cultivate eco-friendly crops and operate organic food chains',
    colorClass: 'border-green-500/30 text-green-400 bg-green-500/10',
  },
  {
    code: 'artisan',
    name: '명품 장인',
    enName: 'Master Artisan',
    icon: '⚒️',
    roleDescription: '고급 장비 제작, 희귀 인테리어 소품 및 예술품 세공',
    enRoleDescription: 'Craft premium gear, rare interior props, and fine artwork',
    colorClass: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
  },
  {
    code: 'civil_servant',
    name: '행정 공무원',
    enName: 'Civil Servant',
    icon: '🏛️',
    roleDescription: '도시 공공 서비스 집행, 복지 분배 및 규제 감사',
    enRoleDescription: 'Administer civic public services, welfare grants, and audits',
    colorClass: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
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
  const left = Number(cap) - Number(paid);
  return String(Number.isFinite(left) && left > 0 ? Math.floor(left) : 0);
}

export function progressPercent(paid: string, cap: string): number {
  const total = Number(cap);
  const done = Number(paid);
  if (!Number.isFinite(total) || total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((done / total) * 100)));
}

export function rewardSentence(task: WorkTask, locale?: Locale | unknown): string {
  if (locale === 'en') {
    if (task.reward_preview === null) return 'Work reward distribution is currently paused.';
    if (task.reward_preview === '0') {
      return 'You have reached today’s reward cap. EXP is still awarded.';
    }
    if (task.reward_preview !== task.base_reward) {
      return `Complete now to earn ${task.reward_preview} WLD (reduced from ${task.base_reward} WLD due to daily repetitions).`;
    }
    return `Complete now to earn ${task.reward_preview} WLD.`;
  }

  if (task.reward_preview === null) return '지금은 작업 보상 지급이 멈춰 있어요.';
  if (task.reward_preview === '0') {
    return '오늘 받을 수 있는 보상을 모두 채웠어요. 경험치는 그대로 쌓여요.';
  }
  if (task.reward_preview !== task.base_reward) {
    return `지금 마치면 ${task.reward_preview} WLD를 받아요. 기본 ${task.base_reward} WLD에서 오늘 반복한 만큼 줄어든 금액이에요.`;
  }
  return `지금 마치면 ${task.reward_preview} WLD를 받아요.`;
}

export function isSpent(task: WorkTask): boolean {
  return task.taken_today >= task.daily_limit;
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
      // Among active job tasks: unspent daily limit tasks come before finished ones
      if (leftIsActive && rightIsActive) {
        const leftHasQuota = left.taken_today < left.daily_limit;
        const rightHasQuota = right.taken_today < right.daily_limit;
        if (leftHasQuota !== rightHasQuota) {
          return leftHasQuota ? -1 : 1;
        }
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
