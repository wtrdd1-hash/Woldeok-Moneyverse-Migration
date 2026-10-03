export interface KimchiCalcInput {
  domesticPriceKrw: number; // 국내 거래소 가격 (KRW)
  foreignPriceUsd: number; // 해외 거래소 가격 (USD)
  usdKrwExchangeRate: number; // USD/KRW 환율
  investmentAmountKrw: number; // 총 투자/거래 금액 (KRW)
  transferFeeCoin: number; // 코인 출금 전송 수수료 (코인 단위)
  domesticFeeRate?: number; // 국내 거래 수수료 (%) 기본 0.05%
  foreignFeeRate?: number; // 해외 거래 수수료 (%) 기본 0.04%
}

export interface KimchiCalcResult {
  foreignPriceKrwConverted: number; // 해외 가격의 원화 환산액
  premiumRate: number; // 김치프리미엄 (%) 양수면 김프, 음수면 역프
  priceDifferencePerCoin: number; // 1코인당 가격 차이 (원)
  purchasedCoinQuantity: number; // 매수 가능한 코인 수량
  estimatedTransferCostKrw: number; // 전송 수수료 원화 환산액
  totalTradingFeesKrw: number; // 총 거래 수수료 (국내+해외)
  netArbitrageProfitKrw: number; // 순 차익 금액 (원)
  netArbitrageProfitRate: number; // 순 차익 수익률 (%)
  strategyRecommendation: string;
  statusTag: 'HIGH_PREMIUM' | 'NORMAL' | 'DISCOUNT_REVERSE';
}

export function calculateKimchiPremium(input: KimchiCalcInput): KimchiCalcResult {
  const domesticKrw = Math.max(0, input.domesticPriceKrw);
  const foreignUsd = Math.max(0, input.foreignPriceUsd);
  const exchangeRate = Math.max(1, input.usdKrwExchangeRate);
  const investKrw = Math.max(0, input.investmentAmountKrw);
  const transferFeeCoin = Math.max(0, input.transferFeeCoin);
  const domesticFeeRate = input.domesticFeeRate ?? 0.05;
  const foreignFeeRate = input.foreignFeeRate ?? 0.04;

  // 해외 가격을 원화로 환산
  const foreignPriceKrwConverted = Number((foreignUsd * exchangeRate).toFixed(4));

  // 김치프리미엄 (%) = (국내 - 해외환산) / 해외환산 * 100
  const premiumRate = foreignPriceKrwConverted > 0
    ? Number((((domesticKrw - foreignPriceKrwConverted) / foreignPriceKrwConverted) * 100).toFixed(2))
    : 0;

  // 1코인당 가격 차이 (원)
  const priceDifferencePerCoin = Number((domesticKrw - foreignPriceKrwConverted).toFixed(2));

  // 매수 가능 코인 수량 (해외에서 매수하여 국내로 보낼 때 기준)
  const purchasedCoinQuantity = foreignPriceKrwConverted > 0
    ? Number((investKrw / foreignPriceKrwConverted).toFixed(6))
    : 0;

  // 전송 수수료 원화 환산액
  const estimatedTransferCostKrw = Math.round(transferFeeCoin * domesticKrw);

  // 총 매매 수수료 (해외 매수 수수료 + 국내 매도 수수료)
  const totalTradingFeesKrw = Math.round(
    investKrw * (foreignFeeRate / 100) + (investKrw * (1 + premiumRate / 100)) * (domesticFeeRate / 100)
  );

  // 순 차익 금액 = (수량 - 전송수수료코인) * 국내가격 - 투자원금 - 거래수수료
  const netCoinQuantity = Math.max(0, purchasedCoinQuantity - transferFeeCoin);
  const grossSellAmountKrw = netCoinQuantity * domesticKrw;
  const netArbitrageProfitKrw = investKrw > 0
    ? Math.round(grossSellAmountKrw - investKrw - totalTradingFeesKrw)
    : 0;

  // 순 차익 수익률 (%)
  const netArbitrageProfitRate = investKrw > 0
    ? Number(((netArbitrageProfitKrw / investKrw) * 100).toFixed(2))
    : 0;

  let statusTag: 'HIGH_PREMIUM' | 'NORMAL' | 'DISCOUNT_REVERSE' = 'NORMAL';
  let strategyRecommendation = '';

  if (premiumRate >= 5.0) {
    statusTag = 'HIGH_PREMIUM';
    strategyRecommendation = `김치프리미엄이 +${premiumRate}%로 매우 높습니다. 국내 매수는 가격 거품 리스크가 크며, 해외 매수 후 국내 매도(보따리 차익) 포지션이 유리합니다.`;
  } else if (premiumRate <= -1.0) {
    statusTag = 'DISCOUNT_REVERSE';
    strategyRecommendation = `역프리미엄(${premiumRate}%) 상태입니다. 국내 거래소가 해외보다 저렴하므로 국내 매수 후 해외 전송 또는 현물 적립 매수에 최적의 타이밍입니다.`;
  } else {
    statusTag = 'NORMAL';
    strategyRecommendation = `김치프리미엄이 +${premiumRate}%로 안정적인 균형 구간입니다. 큰 가격 왜곡 없이 표준 시세로 거래하기 안전합니다.`;
  }

  return {
    foreignPriceKrwConverted,
    premiumRate,
    priceDifferencePerCoin,
    purchasedCoinQuantity,
    estimatedTransferCostKrw,
    totalTradingFeesKrw,
    netArbitrageProfitKrw,
    netArbitrageProfitRate,
    strategyRecommendation,
    statusTag,
  };
}
