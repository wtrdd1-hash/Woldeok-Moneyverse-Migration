/**
 * 가상 파생상품 & 10x 레버리지 선물 거래소 계약 및 정산 엔진
 * 
 * 10대 가상 주식 대상 격리 마진(Isolated Margin) 1x~10x 롱/숏 레버리지,
 * 청산가(Liquidation Price) 계산, 8시간 주기 펀딩비, TP/SL 예약 및
 * 50% 국고 보험펀드 적립 + 50% 영구 소각(Hard Sink) 정산 규칙을 제공합니다.
 */

export type PositionSide = 'LONG' | 'SHORT';
export type MarginMode = 'ISOLATED';

export interface DerivativesMarketSymbol {
  symbol: string;
  name: string;
  currentPrice: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  fundingRate: number; // e.g. 0.01 (0.01%)
  nextFundingHours: number; // hours remaining
  longRatio: number; // e.g. 58 (%)
  shortRatio: number; // e.g. 42 (%)
  description: string;
}

export interface DerivativesPosition {
  id: string;
  symbol: string;
  name: string;
  side: PositionSide;
  marginMode: MarginMode;
  leverage: number; // 1 to 10
  entryPrice: number;
  currentPrice: number;
  margin: number; // WLD
  positionValue: number; // margin * leverage
  quantity: number; // positionValue / entryPrice
  liquidationPrice: number;
  takeProfitPrice?: number | undefined;
  stopLossPrice?: number | undefined;
  pnl: number; // WLD (+ or -)
  roi: number; // % (+ or -)
  createdAt: string;
}

export interface LiquidationHeatmapCluster {
  price: number;
  volume: number;
  type: 'LONG_LIQUIDATION' | 'SHORT_LIQUIDATION';
  intensity: number; // 0 to 100
}

export interface DerivativesOrderPayload {
  symbol: string;
  side: PositionSide;
  leverage: number;
  margin: number;
  takeProfitPrice?: number | undefined;
  stopLossPrice?: number | undefined;
}

export interface LiquidationSettlementResult {
  margin: number;
  insuranceFundDeposit: number;
  hardBurnWld: number;
}

export const MAINTENANCE_MARGIN_RATE = 0.05; // 5% 유지 증거금률

export const LEVERAGE_PRESETS = [1, 2, 3, 5, 10] as const;

export const DERIVATIVES_MARKET_SYMBOLS: DerivativesMarketSymbol[] = [
  {
    symbol: 'WDG',
    name: '월덕게임즈',
    currentPrice: 12500,
    change24h: 3.42,
    high24h: 12900,
    low24h: 11800,
    volume24h: 48200000,
    fundingRate: 0.01,
    nextFundingHours: 4,
    longRatio: 62,
    shortRatio: 38,
    description: '가상 메타버스 게임 개발 및 Web3 엔터테인먼트 대장주',
  },
  {
    symbol: 'WFIN',
    name: '월덱 파이낸셜',
    currentPrice: 537757,
    change24h: 1.85,
    high24h: 545000,
    low24h: 530000,
    volume24h: 31500000,
    fundingRate: 0.005,
    nextFundingHours: 4,
    longRatio: 52,
    shortRatio: 48,
    description: '가상 종합금융투자 및 중앙은행 채권 유동성 공급사',
  },
  {
    symbol: 'CHIMU',
    name: '치무테크',
    currentPrice: 25000,
    change24h: 7.85,
    high24h: 25800,
    low24h: 23100,
    volume24h: 78900000,
    fundingRate: 0.018,
    nextFundingHours: 4,
    longRatio: 74,
    shortRatio: 26,
    description: '차세대 퀀텀 컴퓨팅 칩셋 및 분산형 AI 가속기 선도기업',
  },
  {
    symbol: 'NEXUS',
    name: '넥서스AI',
    currentPrice: 45000,
    change24h: 12.15,
    high24h: 46200,
    low24h: 39800,
    volume24h: 125000000,
    fundingRate: 0.025,
    nextFundingHours: 4,
    longRatio: 81,
    shortRatio: 19,
    description: '초거대 멀티모달 자율 에이전트 인프라 및 LLM 솔루션',
  },
  {
    symbol: 'BIO',
    name: '월덕바이오',
    currentPrice: 6200,
    change24h: -4.32,
    high24h: 6600,
    low24h: 6050,
    volume24h: 19800000,
    fundingRate: -0.012,
    nextFundingHours: 4,
    longRatio: 35,
    shortRatio: 65,
    description: '가상 줄기세포 및 노화 역전 바이오테크 신약 개발사',
  },
  {
    symbol: 'SOLAR',
    name: '솔라에너지',
    currentPrice: 18300,
    change24h: 2.18,
    high24h: 18700,
    low24h: 17900,
    volume24h: 27400000,
    fundingRate: 0.008,
    nextFundingHours: 4,
    longRatio: 55,
    shortRatio: 45,
    description: '초고효율 우주 궤도 태양광 발전 및 친환경 에너지 그리드',
  },
  {
    symbol: 'QUANT',
    name: '퀀트인베스트',
    currentPrice: 34000,
    change24h: 5.60,
    high24h: 34800,
    low24h: 32000,
    volume24h: 56000000,
    fundingRate: 0.015,
    nextFundingHours: 4,
    longRatio: 68,
    shortRatio: 32,
    description: '고빈도 알고리즘 트레이딩(HFT) 및 차익거래 펀드 운용사',
  },
  {
    symbol: 'CYBER',
    name: '사이버시큐리티',
    currentPrice: 15600,
    change24h: -0.85,
    high24h: 16100,
    low24h: 15300,
    volume24h: 21300000,
    fundingRate: 0.002,
    nextFundingHours: 4,
    longRatio: 51,
    shortRatio: 49,
    description: '양자 내성 암호화 및 영지식 증명(ZK) 보안 방화벽',
  },
  {
    symbol: 'SPACE',
    name: '스페이스X덕',
    currentPrice: 52000,
    change24h: 8.90,
    high24h: 53500,
    low24h: 47200,
    volume24h: 142000000,
    fundingRate: 0.022,
    nextFundingHours: 4,
    longRatio: 77,
    shortRatio: 23,
    description: '재사용 궤도 발사체 및 행성 간 자원 채굴 메카트로닉스',
  },
  {
    symbol: 'ROBOT',
    name: '로보틱스코리아',
    currentPrice: 29800,
    change24h: 4.12,
    high24h: 30500,
    low24h: 28400,
    volume24h: 41000000,
    fundingRate: 0.011,
    nextFundingHours: 4,
    longRatio: 64,
    shortRatio: 36,
    description: '휴머노이드 협동 로봇 및 스마트 팩토리 자동화 시스템',
  },
];

/**
 * 격리 마진(Isolated Margin) 예상 청산가 계산 함수
 * 
 * - 롱 포지션: 진입가 * (1 - (1 / 레버리지) + 유지증거금률)
 * - 숏 포지션: 진입가 * (1 + (1 / 레버리지) - 유지증거금률)
 */
export function calculateLiquidationPrice(
  entryPrice: number,
  leverage: number,
  side: PositionSide,
  maintenanceMarginRate: number = MAINTENANCE_MARGIN_RATE,
): number {
  if (entryPrice <= 0 || leverage <= 0) return 0;

  const validLeverage = Math.max(1, Math.min(10, leverage));

  if (side === 'LONG') {
    const liqPrice = entryPrice * (1 - 1 / validLeverage + maintenanceMarginRate);
    return Math.max(1, Math.round(liqPrice));
  } else {
    const liqPrice = entryPrice * (1 + 1 / validLeverage - maintenanceMarginRate);
    return Math.max(1, Math.round(liqPrice));
  }
}

/**
 * 파생상품 실시간 미실현 손익(PnL) 및 수익률(ROI %) 계산 함수
 */
export function calculateDerivativesPnL(
  entryPrice: number,
  currentPrice: number,
  margin: number,
  leverage: number,
  side: PositionSide,
): { pnl: number; roi: number } {
  if (entryPrice <= 0 || margin <= 0 || leverage <= 0) {
    return { pnl: 0, roi: 0 };
  }

  const validLeverage = Math.max(1, Math.min(10, leverage));
  const positionValue = margin * validLeverage;
  const priceRatio = (currentPrice - entryPrice) / entryPrice;

  let rawPnl = 0;
  if (side === 'LONG') {
    rawPnl = positionValue * priceRatio;
  } else {
    rawPnl = positionValue * -priceRatio;
  }

  // 청산 방어: 최대 손실은 증거금(100%)으로 제한
  const pnl = Math.max(-margin, Math.round(rawPnl));
  const roi = Number(((pnl / margin) * 100).toFixed(2));

  return { pnl, roi };
}

/**
 * 8시간 주기 펀딩비 계산 함수 (WLD 단위)
 */
export function calculateFundingFee(positionValue: number, fundingRate: number): number {
  if (positionValue <= 0) return 0;
  return Math.round(positionValue * (fundingRate / 100));
}

/**
 * 청산 발생 시 증거금 정산 함수:
 * - 50%는 중앙은행 청산 보험 기금(Insurance Fund) 적립
 * - 50%는 WLD 영구 소각(Hard Sink)
 */
export function calculateLiquidationSettlement(margin: number): LiquidationSettlementResult {
  if (margin <= 0) {
    return { margin: 0, insuranceFundDeposit: 0, hardBurnWld: 0 };
  }

  const insuranceFundDeposit = Math.round(margin * 0.5);
  const hardBurnWld = margin - insuranceFundDeposit;

  return {
    margin,
    insuranceFundDeposit,
    hardBurnWld,
  };
}

/**
 * 현재가 기준 청산 히트맵 클러스터 데이터 생성기
 */
export function generateLiquidationHeatmap(
  currentPrice: number,
  leveragePresets: readonly number[] = LEVERAGE_PRESETS,
): LiquidationHeatmapCluster[] {
  const clusters: LiquidationHeatmapCluster[] = [];

  for (const lev of leveragePresets) {
    if (lev === 1) continue; // 1배는 청산 없음

    // 롱 청산 클러스터 (현재가 하단)
    const longLiq = calculateLiquidationPrice(currentPrice, lev, 'LONG');
    clusters.push({
      price: longLiq,
      volume: lev * 15000000,
      type: 'LONG_LIQUIDATION',
      intensity: Math.min(100, lev * 10),
    });

    // 숏 청산 클러스터 (현재가 상단)
    const shortLiq = calculateLiquidationPrice(currentPrice, lev, 'SHORT');
    clusters.push({
      price: shortLiq,
      volume: lev * 12000000,
      type: 'SHORT_LIQUIDATION',
      intensity: Math.min(100, lev * 9),
    });
  }

  return clusters.sort((a, b) => a.price - b.price);
}
