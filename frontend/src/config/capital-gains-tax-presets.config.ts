export interface TaxPreset {
  slug: string;
  name: string;
  nameEn: string;
  realizedGainKrw: number; // 실현 수익 (원)
  unrealizedLossKrw: number; // 손실 종목 금액 (원)
  applyLossHarvesting: boolean; // 손실 상계 매도 적용 여부
  applyBasicDeduction: boolean; // 연 250만원 기본공제 적용
  applySpouseGiftDeduction: boolean; // 배우자 증여(6억) 활용 여부
  description: string;
  seoKeywords: string[];
}

export const CAPITAL_GAINS_TAX_PRESETS: TaxPreset[] = [
  {
    slug: 'nvda-gain-5m',
    name: '엔비디아 500만원 익절 양도세',
    nameEn: 'NVIDIA 5M KRW Profit Tax',
    realizedGainKrw: 5000000,
    unrealizedLossKrw: 2500000,
    applyLossHarvesting: false,
    applyBasicDeduction: true,
    applySpouseGiftDeduction: false,
    description: '엔비디아 500만원 수익 실현 시 기본공제 250만원 적용 후 예상 세금 및 손실 상계 팁',
    seoKeywords: ['해외주식 양도소득세 계산기', '미국주식 250만원 비과세', '엔비디아 양도세', '해외주식 22% 세금'],
  },
  {
    slug: 'tsla-gain-10m',
    name: '테슬라 1,000만원 익절 양도세',
    nameEn: 'Tesla 10M KRW Profit Tax',
    realizedGainKrw: 10000000,
    unrealizedLossKrw: 4000000,
    applyLossHarvesting: false,
    applyBasicDeduction: true,
    applySpouseGiftDeduction: false,
    description: '테슬라 1,000만원 실현 수익에 대한 22% 양도소득세 및 절세 매도 전략',
    seoKeywords: ['테슬라 주식 양도세', '해외주식 양도세율', '미국주식 세금 계산', '주식 양도소득세 5월 신고'],
  },
  {
    slug: 'tax-loss-harvesting',
    name: '손익 상계 최적화 (세금 0원 만들기)',
    nameEn: 'Tax-loss Harvesting (Zero Tax)',
    realizedGainKrw: 8000000,
    unrealizedLossKrw: 5500000,
    applyLossHarvesting: true,
    applyBasicDeduction: true,
    applySpouseGiftDeduction: false,
    description: '물려있는 손실 종목을 12월에 동시 매도하여 과세표준을 0원으로 만드는 합법적 절세 기술',
    seoKeywords: ['손익상계 계산기', '해외주식 절세법', '연말 주식 손실 매도', 'Tax loss harvesting 한국'],
  },
  {
    slug: '250k-exemption-max',
    name: '250만원 비과세 한도 딱 맞추기',
    nameEn: '2.5M KRW Basic Exemption Maximizer',
    realizedGainKrw: 2500000,
    unrealizedLossKrw: 0,
    applyLossHarvesting: false,
    applyBasicDeduction: true,
    applySpouseGiftDeduction: false,
    description: '매년 세금 0원으로 미국주식 250만원 비과세 혜택을 100% 챙기는 분할 매도',
    seoKeywords: ['미국주식 250만 공제', '해외주식 비과세 한도', '주식 양도세 면제', '해외주식 절세 팁'],
  },
  {
    slug: 'soxl-swing-gain',
    name: 'SOXL 3배 레버리지 1,500만원 수익',
    nameEn: 'SOXL 3X 15M KRW Profit Tax',
    realizedGainKrw: 15000000,
    unrealizedLossKrw: 6000000,
    applyLossHarvesting: false,
    applyBasicDeduction: true,
    applySpouseGiftDeduction: false,
    description: '반도체 3배 레버리지 고수익에 따른 275만원 양도세와 손실 상계 시뮬레이션',
    seoKeywords: ['SOXL 세금 계산기', '레버리지 ETF 양도세', '미국 ETF 세금', '해외주식 손익 통산'],
  },
  {
    slug: 'apple-dividend-gain',
    name: '애플 장기투자 3,000만원 차익',
    nameEn: 'Apple Long-term 30M KRW Gain',
    realizedGainKrw: 30000000,
    unrealizedLossKrw: 10000000,
    applyLossHarvesting: false,
    applyBasicDeduction: true,
    applySpouseGiftDeduction: false,
    description: '대형 빅테크 3천만원 고액 수익 실현 시 연도별 분할 매도 vs 일괄 매도 세금 비교',
    seoKeywords: ['애플 주식 양도세', '해외주식 분할매도 절세', '해외주식 양도소득세 3천만원', '미국주식 세금 아끼기'],
  },
  {
    slug: 'spouse-gift-600m',
    name: '배우자 증여(6억 비과세) 절세 모델',
    nameEn: 'Spouse Gift 600M Exemption Model',
    realizedGainKrw: 50000000,
    unrealizedLossKrw: 0,
    applyLossHarvesting: false,
    applyBasicDeduction: true,
    applySpouseGiftDeduction: true,
    description: '배우자 10년 6억원 증여공제를 활용하여 취득가액을 높이고 양도세를 0원으로 절감',
    seoKeywords: ['해외주식 배우자 증여', '미국주식 증여 양도세 절세', '주식 증여세 면제 한도', '주식 양도세 합법적 절세'],
  },
  {
    slug: 'year-end-split-sale',
    name: '연말/연초 분할 매도 (2년치 500만 공제)',
    nameEn: 'Year-End / New-Year Split Sale',
    realizedGainKrw: 6000000,
    unrealizedLossKrw: 0,
    applyLossHarvesting: false,
    applyBasicDeduction: true,
    applySpouseGiftDeduction: false,
    description: '12월에 250만원 + 1월에 250만원 분할 매도하여 500만원 전액 비과세 혜택 달성',
    seoKeywords: ['해외주식 분할 매도', '12월 1월 주식 매도', '미국주식 500만원 비과세', '양도세 절세 시뮬레이터'],
  },
  {
    slug: 'crypto-tax-sim',
    name: '가상자산 코인 2,000만원 수익 시뮬레이션',
    nameEn: 'Crypto 20M KRW Gain Simulation',
    realizedGainKrw: 20000000,
    unrealizedLossKrw: 5000000,
    applyLossHarvesting: false,
    applyBasicDeduction: true,
    applySpouseGiftDeduction: false,
    description: '가상자산 과세 유예 및 향후 22% 세율 도입 시 예상 납부 세액 및 준비 전략',
    seoKeywords: ['가상자산 과세 계산기', '비트코인 양도세', '코인 세금 22%', '가상화폐 세금 시뮬레이션'],
  },
  {
    slug: 'domestic-major-shareholder',
    name: '국내 대주주 양도소득세 시뮬레이터',
    nameEn: 'Domestic Major Shareholder Tax',
    realizedGainKrw: 100000000,
    unrealizedLossKrw: 20000000,
    applyLossHarvesting: false,
    applyBasicDeduction: true,
    applySpouseGiftDeduction: false,
    description: '국내 주식 대주주(종목당 50억 기준) 양도소득세 22%~27.5% 누진세율 계산',
    seoKeywords: ['국내주식 대주주 기준', '주식 대주주 양도세율', '국내주식 세금 계산기', '대주주 50억 양도세'],
  },
];

export function getCapitalGainsTaxPreset(slug: string): TaxPreset | undefined {
  return CAPITAL_GAINS_TAX_PRESETS.find((p) => p.slug === slug);
}
