export interface DopamineStatusResponse {
  userId: string;
  goldenDuckFeverAvailable: boolean;
  fortuneCookieAvailable: boolean;
  bullBearVotedToday: boolean;
  dailyShowdownsRemaining: number;
  starDropRemaining: number;
}

export interface GoldenDuckClaimResult {
  success: boolean;
  userId: string;
  rewardAmount: number;
  clicks: number;
  multiplier: number;
  claimedAt: string;
}

export interface PetFortuneResult {
  success: boolean;
  userId: string;
  action: 'pet' | 'fortune';
  rewardAmount: number;
  quote: string;
  affinityGained: number;
  claimedAt: string;
}

export interface BullBearVoteResult {
  success: boolean;
  userId: string;
  vote: 'bull' | 'bear';
  stockSymbol: string;
  poolEligible: boolean;
  airdropPoolWld: number;
  settlementTime: string;
}

export interface MiniShowdownResult {
  success: boolean;
  userId: string;
  outcome: 'win' | 'loss';
  stake: number;
  payout: number;
  playerRoll: number[];
  aiRoll: number[];
  resolvedAt: string;
}

export interface StarDropResult {
  success: boolean;
  userId: string;
  tier: 'rare' | 'epic' | 'legendary' | 'mythic';
  rewardAmount: number;
  claimedAt: string;
}

async function postDopamine<T>(endpoint: string, body: Record<string, unknown>): Promise<T | null> {
  try {
    const res = await fetch(`/app-api/v1/engagement/dopamine/${endpoint}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as T;
    
    // 브라우저 환경에서 지갑 갱신 이벤트 전파
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('moneyverse:wallet-updated', { detail: data }));
    }
    
    return data;
  } catch {
    return null;
  }
}

/**
 * 황금 오리 피버 타임 클릭 보상 수령 (최대 5,000 WLD)
 */
export async function claimGoldenDuckFever(clickCount: number, comboMultiplier: number): Promise<GoldenDuckClaimResult | null> {
  return postDopamine<GoldenDuckClaimResult>('golden-duck', {
    clickCount,
    comboMultiplier,
    idempotencyKey: `fever_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  });
}

/**
 * 덕이 펫 쓰다듬기 또는 1일 1회 포춘쿠키 개봉 보상 수령
 */
export async function claimPetFortune(action: 'pet' | 'fortune'): Promise<PetFortuneResult | null> {
  return postDopamine<PetFortuneResult>('pet-fortune', {
    petAction: action,
    idempotencyKey: `pet_${action}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  });
}

/**
 * 상승(Bull) / 하락(Bear) 일일 여론 잭팟 풀 투표
 */
export async function voteBullBear(vote: 'bull' | 'bear', stockSymbol = 'MARKET_OVERALL'): Promise<BullBearVoteResult | null> {
  return postDopamine<BullBearVoteResult>('bull-bear-vote', {
    vote,
    stockSymbol,
  });
}

/**
 * AI 덕이봇과의 1:1 주사위 미니 쇼다운 승부 결과 결제/정산
 */
export async function resolveMiniShowdown(
  outcome: 'win' | 'loss',
  playerRoll: number[],
  aiRoll: number[],
  stake = 100,
): Promise<MiniShowdownResult | null> {
  return postDopamine<MiniShowdownResult>('mini-showdown', {
    outcome,
    playerRoll,
    aiRoll,
    stake,
  });
}

/**
 * 브롤스타즈형 스타 드롭 5연속 탭 최종 등급 보상 수령
 */
export async function claimStarDrop(tapTier: 'rare' | 'epic' | 'legendary' | 'mythic'): Promise<StarDropResult | null> {
  return postDopamine<StarDropResult>('star-drop', {
    tapTier,
    idempotencyKey: `stardrop_${tapTier}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  });
}

/**
 * 일일 도파민 미션 참여 가능 현황 조회
 */
export async function fetchDopamineStatus(): Promise<DopamineStatusResponse | null> {
  try {
    const res = await fetch('/app-api/v1/engagement/dopamine/status', {
      headers: { accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as DopamineStatusResponse;
  } catch {
    return null;
  }
}
