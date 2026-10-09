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

import type { Locale } from './locale';

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
  readonly titleEn?: string;
  readonly titleJa?: string;
  readonly titleZh?: string;
  readonly descEn?: string;
  readonly descJa?: string;
  readonly descZh?: string;
  readonly badgeEn?: string;
  readonly badgeJa?: string;
  readonly badgeZh?: string;
}

export const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  {
    id: 'spin_roulette',
    title: '일일 무료 럭키 룰렛 돌리기',
    titleEn: 'Spin Daily Free Lucky Roulette',
    titleJa: 'デイリー無料ラッキールーレット',
    titleZh: '转动每日免费幸运转盘',
    description: '아케이드에서 24시간 무료 룰렛을 돌려 첫 행운 보너스를 획득하세요.',
    descEn: 'Spin the 24h free wheel in Arcade to claim your initial luck rewards.',
    descJa: 'アーケードで24時間無料ルーレットを回して最初の幸運ボーナスを獲得しましょう。',
    descZh: '在街机中每24小时免费转盘一次，领取初始幸运大礼。',
    rewardWld: 10000,
    rewardXp: 50,
    linkHref: '/arcade',
    badge: '초반 1단계',
    badgeEn: 'Stage 1-1',
    badgeJa: '序盤 1段階',
    badgeZh: '初盘 1阶段',
  },
  {
    id: 'complete_work',
    title: '직업 선택 & 첫 업무 완수',
    titleEn: 'Select Career & Finish Shift',
    titleJa: '職業選択＆初回業務完了',
    titleZh: '选择职业并完成首份工作',
    description: '핀테크 개발자 또는 트레이더 직업으로 첫 업무를 완수하고 시급을 받으세요.',
    descEn: 'Complete your first shift as a Developer or Trader to deposit your salary.',
    descJa: 'フィンテック開発者またはトレーダーとして最初の業務を完了し給与を受給。',
    descZh: '作为工程师或交易员完成首次打卡工作，领取第一笔薪水。',
    rewardWld: 15000,
    rewardXp: 75,
    linkHref: '/work',
    badge: '초반 2단계',
    badgeEn: 'Stage 1-2',
    badgeJa: '序盤 2段階',
    badgeZh: '初盘 2阶段',
  },
  {
    id: 'take_quiz',
    title: 'AI 투자 성향 진단 & 포트폴리오 설계',
    titleEn: 'AI Investor Profile Quiz & Allocation',
    titleJa: 'AI投資タイプ診断＆ポートフォリオ設計',
    titleZh: 'AI投资风险偏好测评与资产配置',
    description: '30초 퀴즈로 내 성향을 진단하고 맞춤형 최적 자산 배분 비중을 확인하세요.',
    descEn: 'Take a 30s quiz to diagnose your risk profile and optimal allocation.',
    descJa: '30秒診断でタイプを判定し、最適な資産配分比率を確認しましょう。',
    descZh: '通过30秒测评诊断投资风格，获取专属最优资产配置比例。',
    rewardWld: 20000,
    rewardXp: 80,
    linkHref: '/roadmap#quiz',
    badge: '초반 3단계',
    badgeEn: 'Stage 1-3',
    badgeJa: '序盤 3段階',
    badgeZh: '初盘 3阶段',
  },
  {
    id: 'open_savings',
    title: '중앙은행 스마트 복리 포켓 개설',
    titleEn: 'Open Central Bank 30-Day Compound Pot',
    titleJa: '中央銀行30日スマート複利預金開設',
    titleZh: '开设中央银行30天智能复利口袋',
    description: '30일 복리 포켓에 여유 자금을 예치하고 매일 자정 복리 이자를 누적하세요.',
    descEn: 'Deposit funds into 30-day pot and compound interest daily at midnight.',
    descJa: '30日複利ポケットに預け入れ、毎日午前0時に利息を複利運用。',
    descZh: '将闲置资金存入30天复利口袋，每日零点自动结息滚存。',
    rewardWld: 25000,
    rewardXp: 100,
    linkHref: '/bank',
    badge: '중반 1단계',
    badgeEn: 'Stage 2-1',
    badgeJa: '中盤 1段階',
    badgeZh: '中盘 1阶段',
  },
  {
    id: 'buy_stock',
    title: 'WDX 가상 주식 10-Depth 호가 첫 매수',
    titleEn: 'Execute WDX Stock 10-Depth Limit Buy',
    titleJa: 'WDX株式 10段階気配値指値買い',
    titleZh: '在WDX股票10档买盘限价挂单建仓',
    description: '침팬지 반도체나 AI 테크 종목을 10단계 호가창에서 첫 매수 체결하세요.',
    descEn: 'Fill your first limit order on WDX-TEC via 10-Depth live orderbook.',
    descJa: 'WDX半導体やAI銘柄を10段階気配値板で初めて約定させましょう。',
    descZh: '在10档深度买卖盘中撮合成交芯片或AI科技龙头股。',
    rewardWld: 30000,
    rewardXp: 125,
    linkHref: '/stocks',
    badge: '중반 2단계',
    badgeEn: 'Stage 2-2',
    badgeJa: '中盤 2段階',
    badgeZh: '中盘 2阶段',
  },
  {
    id: 'use_calculator',
    title: '5대 금융 계산기 0.1초 진단 & 공유',
    titleEn: 'Diagnose with 5 Calculators & Share Card',
    titleJa: '5大金融計算機で診断＆SNS共有',
    titleZh: '使用5大金融计算器极速诊断并分享',
    description: '물타기/복리/부동산/김프/양도세 계산기로 진단하고 바이럴 카드를 확인하세요.',
    descEn: 'Calculate DCA/Compound/Real Estate targets and create viral cards.',
    descJa: 'ナンピン・複利・不動産計算機で診断し、共有カードを作成。',
    descZh: '使用补仓/复利/地产/税费计算器诊断并一键生成精美分享卡。',
    rewardWld: 20000,
    rewardXp: 80,
    linkHref: '/tools',
    badge: '중반 3단계',
    badgeEn: 'Stage 2-3',
    badgeJa: '中盤 3段階',
    badgeZh: '中盘 3阶段',
  },
  {
    id: 'buy_land',
    title: '가상 부동산 메가시티 랜드 분양',
    titleEn: 'Acquire Prime Land in Megacity',
    titleJa: '仮想不動産メガシティランド分譲',
    titleZh: '认购核心地段虚拟地产地块',
    description: '강남 또는 판교 랜드/오피스를 분양받아 매일 패시브 임대료를 수령하세요.',
    descEn: 'Acquire Teheran-ro prime land to receive midnight automated passive rent.',
    descJa: '江南または板橋のランドを取得し、毎晩不労所得家賃を受給。',
    descZh: '认购核心商圈写字楼地块，每晚零点自动坐享被动租金。',
    rewardWld: 50000,
    rewardXp: 200,
    linkHref: '/spaces/real-estate',
    badge: '후반 1단계',
    badgeEn: 'Stage 3-1',
    badgeJa: '終盤 1段階',
    badgeZh: '后盘 1阶段',
  },
];

export function getLocalizedOnboardingStep(step: OnboardingStep, locale: Locale) {
  if (locale === 'en') {
    return {
      title: step.titleEn || step.title,
      description: step.descEn || step.description,
      badge: step.badgeEn || step.badge,
    };
  }
  if (locale === 'ja') {
    return {
      title: step.titleJa || step.title,
      description: step.descJa || step.description,
      badge: step.badgeJa || step.badge,
    };
  }
  if (locale === 'zh') {
    return {
      title: step.titleZh || step.title,
      description: step.descZh || step.description,
      badge: step.badgeZh || step.badge,
    };
  }
  return {
    title: step.title,
    description: step.description,
    badge: step.badge,
  };
}


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
