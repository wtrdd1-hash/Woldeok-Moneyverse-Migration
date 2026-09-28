/**
 * No-Code Quant Bot Studio (노코드 퀀트 봇 스튜디오) Contract & Domain Logic
 */

export type QuantStrategyType = 'DCA' | 'GRID' | 'RSI_MOMENTUM' | 'SMA_CROSSOVER';

export interface QuantBotConfig {
  readonly id: string;
  readonly name: string;
  readonly symbol: string;
  readonly strategyType: QuantStrategyType;
  readonly initialCapitalWld: number;
  readonly intervalMinutes: number;
  readonly takeProfitPct: number;
  readonly stopLossPct: number;
  readonly isActive: boolean;
}

export interface BacktestResult {
  readonly strategyType: QuantStrategyType;
  readonly totalReturnPct: number;
  readonly winRatePct: number;
  readonly maxDrawdownPct: number;
  readonly totalTrades: number;
  readonly winningTrades: number;
  readonly finalCapitalWld: number;
  readonly profitWld: number;
}

export const INITIAL_QUANT_PRESETS: readonly QuantBotConfig[] = [
  {
    id: 'preset-dca-chips',
    name: '침팬지 반도체 4시간 분할 매수 봇',
    symbol: 'CHIPS',
    strategyType: 'DCA',
    initialCapitalWld: 100000,
    intervalMinutes: 240,
    takeProfitPct: 12.5,
    stopLossPct: 8.0,
    isActive: true,
  },
  {
    id: 'preset-grid-ducks',
    name: '월덕 인더스트리 20단 그리드 무한 차익 봇',
    symbol: 'DUCKS',
    strategyType: 'GRID',
    initialCapitalWld: 250000,
    intervalMinutes: 60,
    takeProfitPct: 2.0,
    stopLossPct: 15.0,
    isActive: true,
  },
  {
    id: 'preset-rsi-coin',
    name: '도지 밈 코인 RSI 30/70 스윙 추세추종 봇',
    symbol: 'COIN',
    strategyType: 'RSI_MOMENTUM',
    initialCapitalWld: 50000,
    intervalMinutes: 30,
    takeProfitPct: 18.0,
    stopLossPct: 6.5,
    isActive: false,
  },
];

/**
 * 퀀트 봇 백테스팅 시뮬레이션 엔진
 */
export function simulateQuantStrategy(
  strategyType: QuantStrategyType,
  initialCapital: number,
  takeProfitPct: number,
  stopLossPct: number,
  historicalPrices: readonly number[],
): BacktestResult {
  const safeCapital = Math.max(1000, initialCapital);
  if (!historicalPrices || historicalPrices.length < 2) {
    return {
      strategyType,
      totalReturnPct: 0,
      winRatePct: 0,
      maxDrawdownPct: 0,
      totalTrades: 0,
      winningTrades: 0,
      finalCapitalWld: safeCapital,
      profitWld: 0,
    };
  }

  let capital = safeCapital;
  let peakCapital = safeCapital;
  let maxDrawdown = 0;
  let totalTrades = 0;
  let winningTrades = 0;

  let holdingQty = 0;
  let entryPrice = 0;

  for (let i = 1; i < historicalPrices.length; i++) {
    const prev = historicalPrices[i - 1]!;
    const curr = historicalPrices[i]!;

    if (strategyType === 'DCA') {
      // Periodic buy
      if (i % 3 === 0 && capital > 5000) {
        const buyAmount = Math.min(capital * 0.2, 20000);
        const qty = buyAmount / curr;
        entryPrice = (entryPrice * holdingQty + curr * qty) / (holdingQty + qty);
        holdingQty += qty;
        capital -= buyAmount;
      }
    } else if (strategyType === 'GRID') {
      // Mean reversion
      if (curr < prev * 0.98 && capital > 5000) {
        const buyAmount = capital * 0.15;
        const qty = buyAmount / curr;
        entryPrice = (entryPrice * holdingQty + curr * qty) / (holdingQty + qty);
        holdingQty += qty;
        capital -= buyAmount;
      }
    } else if (strategyType === 'RSI_MOMENTUM') {
      // Oversold buy
      if (curr < prev * 0.95 && holdingQty === 0 && capital > 10000) {
        const buyAmount = capital * 0.8;
        holdingQty = buyAmount / curr;
        entryPrice = curr;
        capital -= buyAmount;
      }
    }

    // Check take profit / stop loss
    if (holdingQty > 0 && entryPrice > 0) {
      const currentPnLPct = ((curr - entryPrice) / entryPrice) * 100;
      if (currentPnLPct >= takeProfitPct || currentPnLPct <= -stopLossPct || i === historicalPrices.length - 1) {
        const sellValue = holdingQty * curr;
        const profit = sellValue - holdingQty * entryPrice;
        capital += sellValue;
        holdingQty = 0;
        entryPrice = 0;
        totalTrades++;
        if (profit > 0) winningTrades++;
      }
    }

    const currentPortfolio = capital + holdingQty * curr;
    if (currentPortfolio > peakCapital) {
      peakCapital = currentPortfolio;
    } else {
      const dd = ((peakCapital - currentPortfolio) / peakCapital) * 100;
      if (dd > maxDrawdown) maxDrawdown = dd;
    }
  }

  const finalCapital = Math.round(capital);
  const profitWld = finalCapital - safeCapital;
  const totalReturnPct = Number(((profitWld / safeCapital) * 100).toFixed(2));
  const winRatePct = totalTrades > 0 ? Number(((winningTrades / totalTrades) * 100).toFixed(1)) : 0;
  const maxDrawdownPct = Number(maxDrawdown.toFixed(2));

  return {
    strategyType,
    totalReturnPct,
    winRatePct,
    maxDrawdownPct,
    totalTrades,
    winningTrades,
    finalCapitalWld: finalCapital,
    profitWld,
  };
}

/**
 * 그리드 매매 상/하단 레벨 가격 배열 생성
 */
export function calculateGridLevels(
  lowerPrice: number,
  upperPrice: number,
  gridCount: number,
): readonly number[] {
  const low = Math.min(lowerPrice, upperPrice);
  const high = Math.max(lowerPrice, upperPrice);
  const count = Math.max(2, Math.min(50, gridCount));
  const step = (high - low) / (count - 1);

  const levels: number[] = [];
  for (let i = 0; i < count; i++) {
    levels.push(Math.round(low + step * i));
  }
  return levels;
}
