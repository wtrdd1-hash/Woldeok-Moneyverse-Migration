export interface SeoPresetData {
  readonly slug: string;
  readonly category: 'compound' | 'stock' | 'farming';
  readonly title: string;
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly heading: string;
  readonly badge: string;
  readonly summary: string;
  readonly params: Record<string, number | string | boolean>;
  readonly calculatedResult: {
    readonly primaryLabel: string;
    readonly primaryValue: string;
    readonly secondaryLabel: string;
    readonly secondaryValue: string;
    readonly tertiaryLabel: string;
    readonly tertiaryValue: string;
    readonly detailText: string;
  };
  readonly faqs: readonly { readonly question: string; readonly answer: string }[];
  readonly howToSteps: readonly { readonly name: string; readonly text: string }[];
}

export const COMPOUND_PRESETS: readonly SeoPresetData[] = [
  {
    slug: '10m-3y-5p',
    category: 'compound',
    title: '1천만원 3년 연 5% 복리 이자 계산기',
    metaTitle: '1천만원 3년 연 5% 복리 이자 계산기 | 세후 만기 수령액 시뮬레이션',
    metaDescription: '10,000,000원을 연 5% 복리로 3년간 예치했을 때의 월별 이자 누적액과 단리 대비 추가 수익을 실시간으로 확인하세요.',
    heading: '1천만원을 3년간 연 5% 복리로 굴렸을 때의 최종 자산',
    badge: '정기예금 복리 인기 프리셋',
    summary: '초기 원금 1,000만원을 연 5% 월복리로 3년(36개월) 동안 묶어둘 경우 발생하는 총 이자와 만기 수령액입니다.',
    params: { principal: 10000000, monthly: 0, rate: 5, years: 3, compoundFreq: 'monthly' },
    calculatedResult: {
      primaryLabel: '3년 후 최종 수령액',
      primaryValue: '11,614,722 WLD',
      secondaryLabel: '순 복리 이자 수익',
      secondaryValue: '+1,614,722 WLD (+16.1%)',
      tertiaryLabel: '단리 대비 추가 수익',
      tertiaryValue: '+114,722 WLD',
      detailText: '원금 1,000만원 기준 매월 약 4.4만 WLD의 이자가 원금에 재투자되어 단리(1,150만원)보다 11.4만원 더 수령합니다.',
    },
    faqs: [
      {
        question: '1천만원을 연 5% 복리로 3년 예치하면 얼마를 받나요?',
        answer: '월복리 기준 3년 만기 시 원금 1,000만원에 이자 161만 4,722원이 더해져 총 11,614,722원을 수령하게 됩니다.',
      },
      {
        question: '단리와 복리의 차이는 얼마인가요?',
        answer: '단리는 매년 50만원씩 3년간 총 150만원의 이자가 붙지만, 복리는 이자에 이자가 붙어 약 161.4만원이 되어 11.4만원의 추가 이득이 생깁니다.',
      },
      {
        question: '가상 머니버스 은행에서도 동일하게 적용되나요?',
        answer: '네, 월덕 머니버스 가상 은행은 실제 핀테크 복리 공식을 100% 동일하게 지원하여 매일 자정에 복리 이자가 원장에 합산됩니다.',
      },
    ],
    howToSteps: [
      { name: '원금 확인', text: '1,000만 WLD를 가상 은행 입출금 통장에 준비합니다.' },
      { name: '복리 적금 가입', text: '은행 탭에서 3년 만기 연 5% 복리 상품을 선택합니다.' },
      { name: '만기 수령', text: '36개월 뒤 11,614,722 WLD를 자동으로 수령합니다.' },
    ],
  },
  {
    slug: '10m-5y-10p',
    category: 'compound',
    title: '1천만원 5년 연 10% 복리 투자 시뮬레이터',
    metaTitle: '1천만원 5년 연 10% 복리 계산기 | 1.6배 목돈 굴리기 수익률',
    metaDescription: '1천만원을 연 10% 복리로 5년간 굴렸을 때 자산이 1.61배로 불어나는 마법을 시각화 그래프로 확인하세요.',
    heading: '1천만원이 5년 만에 1,645만원이 되는 복리의 마법',
    badge: '중수익 투자 프리셋',
    summary: '연 10%의 수익률을 5년간 복리로 유지하면 원금 1,000만원은 1,645만 3,089원으로 64.5% 불어납니다.',
    params: { principal: 10000000, monthly: 0, rate: 10, years: 5, compoundFreq: 'monthly' },
    calculatedResult: {
      primaryLabel: '5년 후 최종 자산',
      primaryValue: '16,453,089 WLD',
      secondaryLabel: '순 복리 수익',
      secondaryValue: '+6,453,089 WLD (+64.5%)',
      tertiaryLabel: '단리 대비 추가 수익',
      tertiaryValue: '+1,453,089 WLD',
      detailText: '단리 50% 수익률(1,500만원) 대비 복리는 145.3만원 더 많은 1,645.3만원의 수익을 제공합니다.',
    },
    faqs: [
      {
        question: '연 10% 복리로 5년이면 원금 대비 몇 % 수익인가요?',
        answer: '총 수익률은 64.53%이며, 원금 1천만원이 1,645만원으로 증가합니다.',
      },
      {
        question: '72의 법칙으로 계산하면 몇 년 만에 2배가 되나요?',
        answer: '72 ÷ 10 = 약 7.2년 만에 원금이 2배(2,000만원)에 도달하게 됩니다.',
      },
    ],
    howToSteps: [
      { name: '종잣돈 마련', text: '1,000만 WLD를 투자 계좌로 이동합니다.' },
      { name: '고수익 채권/배당주 매수', text: '연 10% 기대수익률의 자산 포트폴리오를 구성합니다.' },
      { name: '5년 보유', text: '배당금을 전액 재투자하여 복리 효과를 극대화합니다.' },
    ],
  },
  {
    slug: 'monthly-1m-5y',
    category: 'compound',
    title: '월 100만원 5년 1억 모으기 적금 계산기',
    metaTitle: '월 100만원 5년 적금 복리 계산기 | 1억 만들기 필수 시뮬레이터',
    metaDescription: '매월 100만원씩 5년간 연 6% 복리 적금에 납입했을 때 원금 6,000만원과 누적 이자를 합산해 1억 원에 도달하는 과정을 계산합니다.',
    heading: '월 100만원씩 5년 납입 시 최종 수령액 및 1억 달성 기간',
    badge: '1억 모으기 적금 프리셋',
    summary: '매월 100만원 적립 시 5년간 총 납입 원금은 6,000만원이며, 복리 이자 합산 시 약 7,000만원을 달성합니다.',
    params: { principal: 0, monthly: 1000000, rate: 6, years: 5, compoundFreq: 'monthly' },
    calculatedResult: {
      primaryLabel: '5년 후 만기 수령액',
      primaryValue: '69,770,030 WLD',
      secondaryLabel: '순 적금 이자',
      secondaryValue: '+9,770,030 WLD (원금의 16.3%)',
      tertiaryLabel: '총 납입 원금',
      tertiaryValue: '60,000,000 WLD',
      detailText: '원금 6,000만원에 복리 이자 977만원이 붙어 6,977만원이 모이며, 1억원 달성까지 약 1.8년이 더 소요됩니다.',
    },
    faqs: [
      {
        question: '월 100만원씩 모아서 1억을 모으려면 몇 년이 걸리나요?',
        answer: '연 6% 복리 기준 약 6.8년(82개월) 동안 납입하면 순수 납입금과 이자로 1억원을 돌파합니다.',
      },
    ],
    howToSteps: [
      { name: '자동이체 설정', text: '매월 1일 100만 WLD 자동이체를 등록합니다.' },
      { name: '복리 적금 유지', text: '5년간 중도해지 없이 복리 이자를 누적합니다.' },
      { name: '목돈 수령', text: '만기 시 69,770,030 WLD를 수령합니다.' },
    ],
  },
  {
    slug: '50m-1y-7p',
    category: 'compound',
    title: '5천만원 1년 정기예금 연 7% 이자 계산기',
    metaTitle: '5천만원 1년 정기예금 복리 계산기 | 연 7% 세후 이자 350만원',
    metaDescription: '5,000만원을 1년간 연 7% 복리로 묶었을 때 매달 불어나는 이자와 만기 5,361만원 수령액을 확인하세요.',
    heading: '5천만원을 1년간 연 7%로 굴렸을 때의 수익',
    badge: '단기 목돈 굴리기 프리셋',
    summary: '목돈 5천만원을 연 7% 월복리로 1년 예치 시 총 361만 4,896원의 이자가 발생합니다.',
    params: { principal: 50000000, monthly: 0, rate: 7, years: 1, compoundFreq: 'monthly' },
    calculatedResult: {
      primaryLabel: '1년 후 만기 수령액',
      primaryValue: '53,614,896 WLD',
      secondaryLabel: '1년 순 이자',
      secondaryValue: '+3,614,896 WLD (+7.23%)',
      tertiaryLabel: '월 환산 이자',
      tertiaryValue: '약 301,241 WLD/월',
      detailText: '단리 350만원 대비 복리는 11.4만원 더 많은 361.4만원의 순이자를 제공합니다.',
    },
    faqs: [
      {
        question: '5천만원을 1년 예금하면 월 이자가 얼마인가요?',
        answer: '월 환산 시 약 30만 1,241원의 이자 수익이 발생합니다.',
      },
    ],
    howToSteps: [
      { name: '5천만원 입금', text: '예금 계좌에 5,000만 WLD를 거치합니다.' },
      { name: '1년 정기예금 가입', text: '연 7% 정기예금 상품을 체결합니다.' },
    ],
  },
  {
    slug: '100m-10y-15p',
    category: 'compound',
    title: '1억원 10년 15% 가상 복리 투자 수익 예측기',
    metaTitle: '1억원 10년 연 15% 복리 계산기 | 4배로 불어나는 4억 달성 공식',
    metaDescription: '1억 원을 연 15% 고수익 복리로 10년간 재투자했을 때 4억 4,400만원으로 4.4배 성장하는 복리 그래프를 확인하세요.',
    heading: '1억원이 10년 뒤 4억 4,402만원으로 점프하는 슈퍼 복리',
    badge: '장기 자산 증식 프리셋',
    summary: '연 15% 복리를 10년간 유지하면 원금 1억원은 4억 4,402만 1,323원으로 344% 성장합니다.',
    params: { principal: 100000000, monthly: 0, rate: 15, years: 10, compoundFreq: 'monthly' },
    calculatedResult: {
      primaryLabel: '10년 후 최종 자산',
      primaryValue: '444,021,323 WLD',
      secondaryLabel: '순 복리 수익',
      secondaryValue: '+344,021,323 WLD (+344%)',
      tertiaryLabel: '단리 대비 초과 수익',
      tertiaryValue: '+194,021,323 WLD',
      detailText: '단리 10년(2.5억원) 대비 복리는 1억 9,402만원을 더 창출하여 4.44배로 불어납니다.',
    },
    faqs: [
      {
        question: '1억이 4억이 되려면 몇 년이 걸리나요?',
        answer: '연 15% 복리 수익률 기준 정확히 10년 만에 4억 4,400만원에 도달합니다.',
      },
    ],
    howToSteps: [
      { name: '장기 펀드 가입', text: '가상 배당 펀드에 1억 WLD를 예치합니다.' },
      { name: '10년 재투자', text: '배당금을 10년간 인출하지 않고 자동 복리 매수합니다.' },
    ],
  },
];

export const STOCK_PRESETS: readonly SeoPresetData[] = [
  {
    slug: 'chips-minus-20',
    category: 'stock',
    title: '침팬지 반도체(CHIPS) -20% 물타기 평단가 계산기',
    metaTitle: '침팬지 반도체(CHIPS) -20% 물타기 계산기 | 평단가 희석 및 탈출가 역산',
    metaDescription: '침팬지 반도체 100,000원에 매수 후 80,000원으로 20% 하락 시 1배수/2배수 추가 매수 시 변경되는 평단가와 본전 탈출 필요 반등률을 계산합니다.',
    heading: 'CHIPS 10만원에 물렸을 때 8만원에서 물타기하면 평단가는?',
    badge: '대형주 물타기 프리셋',
    summary: '100,000원에 100주 매수 후 80,000원에서 동일 수량 100주 추가 매수 시 평단가는 90,000원(-11.1% 반등 시 탈출)으로 내려옵니다.',
    params: { currentPrice: 100000, currentQty: 100, addPrice: 80000, addQty: 100, targetProfitRate: 5 },
    calculatedResult: {
      primaryLabel: '최종 희석 평단가',
      primaryValue: '90,000 WLD',
      secondaryLabel: '본전 탈출 필요 반등률',
      secondaryValue: '+12.5% (기존 +25%에서 대폭 감소)',
      tertiaryLabel: '+5% 익절 목표가',
      tertiaryValue: '94,500 WLD',
      detailText: '총 투자금 1,800만 WLD, 보유 수량 200주가 되며 90,000원 이상 반등 시 전액 본전 회수가 가능합니다.',
    },
    faqs: [
      {
        question: '-20% 하락했을 때 1:1로 물타면 평단가가 몇 % 떨어지나요?',
        answer: '정확히 중간 지점인 -10% 지점(90,000원)으로 평단가가 내려옵니다.',
      },
      {
        question: '물타기 후 본전까지 필요한 상승률은 얼마인가요?',
        answer: '물타기 전에는 +25%가 올라야 본전이었으나, 물타기 후에는 +12.5%만 올라도 원금을 회수할 수 있습니다.',
      },
    ],
    howToSteps: [
      { name: '보유 평단 확인', text: '100,000원에 100주 매수한 기록을 확인합니다.' },
      { name: '추가 매수 주문', text: '현재가 80,000원에 100주 추가 매수합니다.' },
      { name: '목표가 알림 설정', text: '94,500원 도달 시 자동 매도 알림을 설정합니다.' },
    ],
  },
  {
    slug: 'ducks-minus-50',
    category: 'stock',
    title: '월덕 인더스트리(DUCKS) -50% 반토막 2배수 물타기 탈출 공식',
    metaTitle: '반토막 -50% 주식 2배수 물타기 계산기 | 본전 탈출 평단가 역산',
    metaDescription: '주가가 50% 폭락하여 반토막 났을 때 기존 수량의 2배를 추가 매수하여 평단가를 66.7% 수준으로 낮추고 +50% 반등 시 탈출하는 공식입니다.',
    heading: '주가 -50% 반토막 시 2배수 물타기 손익분기점 계산',
    badge: '급락주 탈출 프리셋',
    summary: '50,000원 주식이 25,000원으로 반토막 났을 때 기존 100주 대비 200주를 2.5만원에 추가 매수하면 평단가는 33,333원이 됩니다.',
    params: { currentPrice: 50000, currentQty: 100, addPrice: 25000, addQty: 200, targetProfitRate: 10 },
    calculatedResult: {
      primaryLabel: '2배수 물타기 평단가',
      primaryValue: '33,333 WLD (-33.3%)',
      secondaryLabel: '탈출 필요 반등률',
      secondaryValue: '+33.3% (기존 +100% 대비 1/3)',
      tertiaryLabel: '+10% 익절 매도가',
      tertiaryValue: '36,666 WLD',
      detailText: '총 300주, 투자원금 1,000만 WLD가 되며 주가가 33,334원만 넘어가면 플러스로 돌아섭니다.',
    },
    faqs: [
      {
        question: '반토막 난 주식은 물타기 안 하면 몇 % 올라야 하나요?',
        answer: '물타기를 하지 않으면 +100%가 올라야 본전이지만, 2배수 물타기 시 +33.3%만 올라도 본전이 됩니다.',
      },
    ],
    howToSteps: [
      { name: '2배수 자금 준비', text: '기존 투자액(500만)의 100%인 500만 WLD를 준비합니다.' },
      { name: '2.5만원 분할 매수', text: '200주를 25,000원에 매수합니다.' },
    ],
  },
  {
    slug: 'coin-minus-30',
    category: 'stock',
    title: '도지 밈 파이낸스(COIN) -30% 손익분기점 매도가 계산기',
    metaTitle: '도지 밈 파이낸스(COIN) -30% 물타기 손익분기점 계산기',
    metaDescription: '변동성이 큰 COIN 종목 -30% 손실 구간에서 1.5배수 추가 매수 시 수수료와 거래세를 포함한 실질 손익분기 매도가격을 계산합니다.',
    heading: 'COIN -30% 물타기 시 수수료 포함 실질 탈출 가격',
    badge: '밈코인 변동성 프리셋',
    summary: '1,000원에 10,000주 매수 후 700원에 15,000주 매수 시 평단가는 820원(수수료 포함 821.5원)이 됩니다.',
    params: { currentPrice: 1000, currentQty: 10000, addPrice: 700, addQty: 15000, targetProfitRate: 0 },
    calculatedResult: {
      primaryLabel: '실질 손익분기 매도가',
      primaryValue: '821.5 WLD',
      secondaryLabel: '필요 반등률',
      secondaryValue: '+17.3% (기존 +42.8% 대비 대폭 경감)',
      tertiaryLabel: '총 보유 수량',
      tertiaryValue: '25,000 주',
      detailText: '증권 거래세 0.18%와 거래 수수료를 모두 고려한 완벽한 실질 손익분기점입니다.',
    },
    faqs: [
      {
        question: '수수료를 고려한 물타기 평단가는 어떻게 계산하나요?',
        answer: '매수 수수료와 매도 시 거래세(0.18%)를 평단가에 가산하여 실질적인 손익분기 가격을 역산합니다.',
      },
    ],
    howToSteps: [
      { name: '700원 지지 확인', text: '호가창에서 700원 매수 잔량을 확인합니다.' },
      { name: '1.5배수 매수', text: '15,000주를 매수하여 평단가를 820원으로 낮춥니다.' },
    ],
  },
];

export const FARMING_PRESETS: readonly SeoPresetData[] = [
  {
    slug: 'intern-vs-executive',
    category: 'farming',
    title: '인턴 vs 임원 일일 WLD 파밍 수익 및 에너지 효율 비교',
    metaTitle: '인턴 vs 임원 일일 WLD 파밍 수익 시뮬레이터 | 직급별 에너지 효율',
    metaDescription: '인턴(시급 500 WLD)과 임원(시급 8,500 WLD)의 24시간 에너지 소모 대비 기대 일일 WLD 채굴량과 월수익 차이를 완벽 비교합니다.',
    heading: '인턴과 임원의 일일 수익 17배 격차 시뮬레이션',
    badge: '직급별 효율 비교 프리셋',
    summary: '인턴은 24시간 에너지 100 기준 일일 약 12,000 WLD를 획득하는 반면, 임원은 최대 204,000 WLD를 파밍할 수 있습니다.',
    params: { jobGrade: '임원', dailyHours: 8, energyEfficiency: 100, weekendBuff: true },
    calculatedResult: {
      primaryLabel: '임원 일일 기대 수익',
      primaryValue: '204,000 WLD/일',
      secondaryLabel: '인턴 일일 기대 수익',
      secondaryValue: '12,000 WLD/일 (17.0배 차이)',
      tertiaryLabel: '월 환산 수익 격차',
      tertiaryValue: '+5,760,000 WLD/월',
      detailText: '주말 2배 피버 버프 적용 시 임원은 월 800만 WLD 이상의 압도적인 가상 재화를 축적할 수 있습니다.',
    },
    faqs: [
      {
        question: '임원으로 승진하려면 어떤 조건이 필요한가요?',
        answer: '누적 과업 완수 500회 달성 및 프레스티지 2성 이상의 자격 요건이 필요합니다.',
      },
    ],
    howToSteps: [
      { name: '매일 일일 퀘스트 완료', text: '숙련도 포인트를 쌓아 직급을 올립니다.' },
      { name: '에너지 드링크 활용', text: '피버 타임에 에너지를 집중 투입합니다.' },
    ],
  },
  {
    slug: 'daily-100k-farming-route',
    category: 'farming',
    title: '하루 10만 WLD 최단 시간 파밍 루트 가이드',
    metaTitle: '하루 10만 WLD 파밍 루틴 시뮬레이터 | 무과금 최단 시간 공략',
    metaDescription: '과장 직급 기준 4시간 플레이로 일일 100,000 WLD를 가장 빠르고 안전하게 파밍할 수 있는 최적 과업 루틴을 계산합니다.',
    heading: '하루 10만 WLD를 4시간 만에 채굴하는 황금 루틴',
    badge: '최단 시간 고수익 프리셋',
    summary: '과장 직급(건당 3,200 WLD)으로 25회 과업을 완수하고 럭키 상자 보너스를 결합하여 10만 WLD를 달성합니다.',
    params: { jobGrade: '과장', dailyHours: 4, energyEfficiency: 95, weekendBuff: false },
    calculatedResult: {
      primaryLabel: '4시간 파밍 총액',
      primaryValue: '102,400 WLD',
      secondaryLabel: '필요 과업 횟수',
      secondaryValue: '25 회 (회당 9.6분)',
      tertiaryLabel: '월 예상 자산',
      tertiaryValue: '3,072,000 WLD/월',
      detailText: '중간중간 럭키 드롭 상자가 등장하여 실제 수익은 11만 WLD 이상으로 증가합니다.',
    },
    faqs: [
      {
        question: '하루 10만 WLD를 모아서 복리 예금에 넣으면 어떻게 되나요?',
        answer: '매일 10만 WLD를 연 10% 복리 예금에 1년간 예치하면 1년 후 약 4,000만 WLD의 자산이 됩니다.',
      },
    ],
    howToSteps: [
      { name: '과장 승진', text: '사원/대리 구간을 거쳐 과장 직급을 활성화합니다.' },
      { name: '4시간 집중 파밍', text: '에너지 소모 효율 95% 이상을 유지하며 과업을 수행합니다.' },
    ],
  },
];

export const ALL_SEO_PRESETS: readonly SeoPresetData[] = [
  ...COMPOUND_PRESETS,
  ...STOCK_PRESETS,
  ...FARMING_PRESETS,
];

export function getPresetBySlug(category: 'compound' | 'stock' | 'farming', slug: string): SeoPresetData | undefined {
  return ALL_SEO_PRESETS.find((p) => p.category === category && p.slug === slug);
}
