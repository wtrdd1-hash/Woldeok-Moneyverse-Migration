/**
 * The vocabulary of the work loop, and the small decisions its screen shares.
 */

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
  readonly icon: string;
  readonly roleDescription: string;
  readonly colorClass: string;
}

export const CAREER_JOBS: readonly JobMeta[] = [
  {
    code: 'developer',
    name: '소프트웨어 개발자',
    icon: '💻',
    roleDescription: '알고리즘 및 시스템 구축, WLD 트랜잭션 최적화 엔진 개발',
    colorClass: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
  },
  {
    code: 'trader',
    name: '전문 트레이더',
    icon: '📈',
    roleDescription: '시장 호가 분석, 차익 거래 및 유동성 공급',
    colorClass: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
  },
  {
    code: 'entertainer',
    name: '엔터테이너',
    icon: '🎭',
    roleDescription: '커뮤니티 콘텐츠 제작, 방송 및 소셜 이벤트 활성화',
    colorClass: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
  },
  {
    code: 'detective',
    name: '경제 탐정',
    icon: '🔍',
    roleDescription: '이상 거래 탐지, 자금 세탁 및 시장 부정행위 조사',
    colorClass: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
  },
  {
    code: 'miner',
    name: '자원 채굴사',
    icon: '⛏️',
    roleDescription: '지하 희귀 광물 탐사 및 가상 원자재 채굴',
    colorClass: 'border-orange-500/30 text-orange-400 bg-orange-500/10',
  },
  {
    code: 'farmer',
    name: '스마트 농부',
    icon: '🌾',
    roleDescription: '친환경 작물 재배 및 유기농 식량 생산 공급망 운영',
    colorClass: 'border-green-500/30 text-green-400 bg-green-500/10',
  },
  {
    code: 'artisan',
    name: '명품 장인',
    icon: '⚒️',
    roleDescription: '고급 장비 제작, 희귀 인테리어 소품 및 예술품 세공',
    colorClass: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
  },
  {
    code: 'civil_servant',
    name: '행정 공무원',
    icon: '🏛️',
    roleDescription: '도시 공공 서비스 집행, 복지 분배 및 규제 감사',
    colorClass: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
  },
];

const JOB_LABELS: Readonly<Record<string, string>> = {
  developer: '소프트웨어 개발자',
  trader: '전문 트레이더',
  entertainer: '엔터테이너',
  detective: '경제 탐정',
  miner: '자원 채굴사',
  farmer: '농부',
  artisan: '명품 장인',
  civil_servant: '행정 공무원',
  carrier: '운반원',
  technician: '기술자',
  merchant: '상인',
};

export function jobLabel(code: string): string {
  return JOB_LABELS[code] ?? code;
}

export function jobMeta(code: string): JobMeta | undefined {
  return CAREER_JOBS.find((j) => j.code === code);
}

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

export function isOpen(assignment: WorkAssignment): boolean {
  return assignment.status === 'assigned' || assignment.status === 'submitted';
}

export function durationLabel(seconds: number): string {
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

export function isSpent(task: WorkTask): boolean {
  return task.taken_today >= task.daily_limit;
}

export function boardOrder(tasks: readonly WorkTask[]): readonly WorkTask[] {
  return [...tasks].sort((left, right) => Number(right.recommended) - Number(left.recommended));
}
