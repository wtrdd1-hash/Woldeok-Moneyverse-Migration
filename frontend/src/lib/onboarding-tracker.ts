/**
 * Interactive Onboarding & Growth Tracker Engine.
 * Tracks user actions across 6 core onboarding steps:
 * 1. spin_roulette (초반 무료 룰렛) -> +10,000 WLD
 * 2. complete_work (인턴 첫 업무) -> +15,000 WLD
 * 3. open_savings (30일 복리 포켓) -> +25,000 WLD
 * 4. buy_stock (WDX 주식 첫 매수) -> +30,000 WLD
 * 5. use_calculator (5대 계산기 진단) -> +20,000 WLD
 * 6. buy_land (가상 랜드/오피스 분양) -> +50,000 WLD
 * Total Onboarding Bonus: 150,000 WLD
 */

export type OnboardingActionType =
  | 'spin_roulette'
  | 'complete_work'
  | 'take_quiz'
  | 'open_savings'
  | 'buy_stock'
  | 'use_calculator'
  | 'buy_land';

export interface OnboardingStep {
  readonly id: OnboardingActionType;
  readonly title: string;
  readonly description: string;
  readonly rewardWld: number;
  readonly rewardXp: number;
  readonly linkHref: string;
  readonly badge: string;
}

export const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  {
    id: 'spin_roulette',
    title: '일일 무료 럭키 룰렛 돌리기',
    description: '카지노에서 24시간 무료 룰렛을 돌려 첫 행운 보너스를 획득하세요.',
    rewardWld: 10000,
    rewardXp: 50,
    linkHref: '/casino',
    badge: '초반 1단계',
  },
  {
    id: 'complete_work',
    title: '직업 선택 & 첫 업무 완수',
    description: '핀테크 개발자 또는 트레이더 직업으로 첫 업무를 완수하고 시급을 받으세요.',
    rewardWld: 15000,
    rewardXp: 75,
    linkHref: '/work',
    badge: '초반 2단계',
  },
  {
    id: 'take_quiz',
    title: 'AI 투자 성향 진단 & 포트폴리오 설계',
    description: '30초 퀴즈로 내 성향을 진단하고 맞춤형 최적 자산 배분 비중을 확인하세요.',
    rewardWld: 20000,
    rewardXp: 80,
    linkHref: '/roadmap#quiz',
    badge: '초반 3단계',
  },
  {
    id: 'open_savings',
    title: '중앙은행 스마트 복리 포켓 개설',
    description: '30일 복리 포켓에 여유 자금을 예치하고 매일 자정 복리 이자를 누적하세요.',
    rewardWld: 25000,
    rewardXp: 100,
    linkHref: '/bank',
    badge: '중반 1단계',
  },
  {
    id: 'buy_stock',
    title: 'WDX 가상 주식 10-Depth 호가 첫 매수',
    description: '침팬지 반도체나 AI 테크 종목을 10단계 호가창에서 첫 매수 체결하세요.',
    rewardWld: 30000,
    rewardXp: 125,
    linkHref: '/stocks',
    badge: '중반 2단계',
  },
  {
    id: 'use_calculator',
    title: '5대 금융 계산기 0.1초 진단 & 공유',
    description: '물타기/복리/부동산/김프/양도세 계산기로 진단하고 바이럴 카드를 확인하세요.',
    rewardWld: 20000,
    rewardXp: 80,
    linkHref: '/tools',
    badge: '중반 3단계',
  },
  {
    id: 'buy_land',
    title: '가상 부동산 메가시티 랜드 분양',
    description: '강남 또는 판교 랜드/오피스를 분양받아 매일 패시브 임대료를 수령하세요.',
    rewardWld: 50000,
    rewardXp: 200,
    linkHref: '/spaces/real-estate',
    badge: '후반 1단계',
  },
];


const STORAGE_KEY = 'moneyverse_onboarding_progress_v1';

export interface OnboardingState {
  readonly completed: readonly OnboardingActionType[];
  readonly claimed: readonly OnboardingActionType[];
  readonly totalEarnedWld: number;
}

let inMemoryState: OnboardingState = {
  completed: [],
  claimed: [],
  totalEarnedWld: 0,
};



export function getOnboardingState(): OnboardingState {
  if (typeof window === 'undefined') {
    return inMemoryState;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return inMemoryState;
    const parsed = JSON.parse(raw);
    inMemoryState = parsed;
    return parsed;
  } catch {
    return inMemoryState;
  }
}

export function saveOnboardingState(state: OnboardingState): void {
  inMemoryState = state;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}


export function markOnboardingActionComplete(action: OnboardingActionType): {
  isNewlyCompleted: boolean;
  state: OnboardingState;
} {
  const current = getOnboardingState();
  if (current.completed.includes(action)) {
    return { isNewlyCompleted: false, state: current };
  }

  const nextState: OnboardingState = {
    ...current,
    completed: [...current.completed, action],
  };
  saveOnboardingState(nextState);
  return { isNewlyCompleted: true, state: nextState };
}

export function claimOnboardingReward(action: OnboardingActionType): {
  rewardWld: number;
  rewardXp: number;
  state: OnboardingState;
} {
  const current = getOnboardingState();
  const step = ONBOARDING_STEPS.find((s) => s.id === action);
  if (!step || current.claimed.includes(action) || !current.completed.includes(action)) {
    return { rewardWld: 0, rewardXp: 0, state: current };
  }

  const nextState: OnboardingState = {
    ...current,
    claimed: [...current.claimed, action],
    totalEarnedWld: current.totalEarnedWld + step.rewardWld,
  };
  saveOnboardingState(nextState);
  return { rewardWld: step.rewardWld, rewardXp: step.rewardXp, state: nextState };
}
