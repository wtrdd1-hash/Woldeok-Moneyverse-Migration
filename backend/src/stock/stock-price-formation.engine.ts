/**
 * Stock Price Formation Engine
 *
 * Implements the deterministic price formation engine specified in
 * docs/planning/AI_ECONOMY_CONTROLLER_SPEC.md §26.
 *
 * AI specialist agents estimate bounded components, but the deterministic
 * engine combines only allowlisted components with hard bounds (circuit breaker,
 * minimum price, volatility clamp, integer rounding, idempotent sequence).
 */

export interface StockPriceComponents {
  readonly symbol: string;
  readonly basePrice: number; // 이전 기준 가격 (정수 WDX)
  readonly fundamentalAnchorReturn?: number; // 펀더멘털 앵커 (-0.05 ~ +0.05)
  readonly orderFlowPressure?: number; // 호가/체결 수급 압력 (-0.08 ~ +0.08)
  readonly liquiditySpreadImpact?: number; // 유동성 스프레드 충격 (-0.03 ~ +0.03)
  readonly momentumContribution?: number; // 모멘텀/추세 반전 기여도 (-0.04 ~ +0.04)
  readonly sectorFactorContribution?: number; // 섹터 공통 요인 (-0.05 ~ +0.05)
  readonly eventShockContribution?: number; // 공시/이벤트 충격 (-0.10 ~ +0.10)
  readonly volatilityRegime?: number; // 변동성 체제 계수 (0.5 ~ 2.0, default 1.0)
  readonly manipulationIntegrityPenalty?: number; // 시세조종 의심 페널티 (0.0 ~ 0.20)
  readonly uncertaintyInterval?: number; // 불확실성 상하한 (default 0.0)
}

export interface StockPriceFormationResult {
  readonly symbol: string;
  readonly basePrice: number;
  readonly newPrice: number; // 최종 결정된 새 가격 (정수 WDX)
  readonly delta: number; // 가격 변화량
  readonly returnPct: number; // 수익률 (백분율)
  readonly rawReturnPct: number; // 바운드 적용 전 순수 합산 수익률
  readonly isCircuitBreakerTriggered: boolean;
  readonly isMinPriceClamped: boolean;
  readonly isIntegrityPenalized: boolean;
  readonly appliedComponents: {
    readonly fundamental: number;
    readonly orderFlow: number;
    readonly liquidity: number;
    readonly momentum: number;
    readonly sector: number;
    readonly event: number;
    readonly volatilityScale: number;
    readonly integrityPenalty: number;
  };
  readonly evaluatedAt: string;
  readonly tickSequenceId: string;
}

export interface EngineConfig {
  readonly maxTickReturnBps: number; // 회당 최대 변동 상하한 (기본 1500 bps = 15%)
  readonly minPriceWdx: number; // 최소 가격 (기본 1 WDX)
  readonly maxPriceWdx: number; // 최대 상한 가격 (기본 10,000,000 WDX)
}

export const DEFAULT_PRICE_ENGINE_CONFIG: EngineConfig = {
  maxTickReturnBps: 1500, // 15% circuit breaker
  minPriceWdx: 1,
  maxPriceWdx: 10_000_000,
};

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * Calculates deterministic stock tick price with strictly bounded components.
 */
export function calculateNextStockPrice(
  input: StockPriceComponents,
  config: EngineConfig = DEFAULT_PRICE_ENGINE_CONFIG,
): StockPriceFormationResult {
  const basePrice = Math.max(1, Math.floor(input.basePrice));
  const volatility = clamp(input.volatilityRegime ?? 1.0, 0.5, 2.0);

  // 1. Clamp each component within strictly allowed bounds (§26.1)
  const fundamental = clamp(input.fundamentalAnchorReturn ?? 0, -0.05, 0.05);
  const orderFlow = clamp(input.orderFlowPressure ?? 0, -0.08, 0.08);
  const liquidity = clamp(input.liquiditySpreadImpact ?? 0, -0.03, 0.03);
  const momentum = clamp(input.momentumContribution ?? 0, -0.04, 0.04);
  const sector = clamp(input.sectorFactorContribution ?? 0, -0.05, 0.05);
  const event = clamp(input.eventShockContribution ?? 0, -0.10, 0.10);
  const integrityPenalty = clamp(input.manipulationIntegrityPenalty ?? 0, 0.0, 0.20);

  // 2. Sum market forces and apply volatility regime
  const grossMarketReturn =
    (fundamental + orderFlow + liquidity + momentum + sector + event) * volatility;

  // 3. Subtract market-integrity manipulation penalty (always downward/cooling)
  const isIntegrityPenalized = integrityPenalty > 0.001;
  const rawReturnPct = (grossMarketReturn - integrityPenalty) * 100;

  // 4. Deterministic Hard Circuit Breaker (e.g. ±15%)
  const maxReturnPct = config.maxTickReturnBps / 100;
  const clampedReturnPct = clamp(rawReturnPct, -maxReturnPct, maxReturnPct);
  const isCircuitBreakerTriggered = Math.abs(rawReturnPct) > maxReturnPct;

  // 5. Calculate integer target price
  const tentativePrice = basePrice * (1 + clampedReturnPct / 100);
  let newPrice = Math.round(tentativePrice);

  // 6. Hard Price Boundaries (Min 1 WDX, Max Cap)
  let isMinPriceClamped = false;
  if (newPrice < config.minPriceWdx) {
    newPrice = config.minPriceWdx;
    isMinPriceClamped = true;
  } else if (newPrice > config.maxPriceWdx) {
    newPrice = config.maxPriceWdx;
  }

  const delta = newPrice - basePrice;
  const actualReturnPct = Number(((delta / basePrice) * 100).toFixed(4));

  const now = new Date().toISOString();
  const tickSequenceId = `tick_${input.symbol}_${Date.now()}`;

  return {
    symbol: input.symbol,
    basePrice,
    newPrice,
    delta,
    returnPct: actualReturnPct,
    rawReturnPct: Number(rawReturnPct.toFixed(4)),
    isCircuitBreakerTriggered,
    isMinPriceClamped,
    isIntegrityPenalized,
    appliedComponents: {
      fundamental,
      orderFlow,
      liquidity,
      momentum,
      sector,
      event,
      volatilityScale: volatility,
      integrityPenalty,
    },
    evaluatedAt: now,
    tickSequenceId,
  };
}
