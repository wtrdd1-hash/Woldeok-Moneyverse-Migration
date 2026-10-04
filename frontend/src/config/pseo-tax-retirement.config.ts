export interface RetirementScenario {
  slug: string;
  title: string;
  serviceYears: number;
  monthlySalary: number; // 원 단위
  description: string;
  irpBenefitDescription: string;
}

export interface PensionTaxScenario {
  slug: string;
  title: string;
  annualSalary: number; // 총급여 (원 단위)
  pensionDeposit: number; // 연금저축 납입액
  irpDeposit: number; // IRP 납입액
  description: string;
}

export interface IsaScenario {
  slug: string;
  title: string;
  type: 'general' | 'frugal'; // 일반형 (200만) vs 서민형 (400만)
  annualProfit: number; // 배당/이자 순수익
  description: string;
}

export const RETIREMENT_SCENARIOS: RetirementScenario[] = [
  {
    slug: 'service-1year',
    title: '근속 1년차 이직 퇴직금 실수령액 계산',
    serviceYears: 1,
    monthlySalary: 3000000,
    description: '사회초년생 및 첫 이직 시 1년 만근 퇴직금 산출과 세후 실수령액 및 IRP 계좌 이체 절세액을 계산합니다.',
    irpBenefitDescription: '퇴직금을 IRP로 이전 시 퇴직소득세 100% 과세이연 및 연금 수령 시 30~40% 세금 감면 혜택',
  },
  {
    slug: 'service-3year',
    title: '근속 3년차 경력직 이직 퇴직금 계산',
    serviceYears: 3,
    monthlySalary: 3800000,
    description: '3년 근속 직장인의 3개월 평균임금 기준 법정 퇴직금 및 실효세율을 정밀 산출합니다.',
    irpBenefitDescription: '새 직장 이직 전 IRP로 보관하여 복리 운용 및 양도소득세/배당소득세 과세이연 효과',
  },
  {
    slug: 'service-5year',
    title: '근속 5년차 대리/과장 퇴직금 실수령액',
    serviceYears: 5,
    monthlySalary: 4500000,
    description: '5년 근속에 따른 근속연수 공제 혜택과 퇴직소득세율 및 실제 수령액을 비교 계산합니다.',
    irpBenefitDescription: '퇴직소득공제 확대와 IRP 계좌 이전 시 절세 효율 분석',
  },
  {
    slug: 'service-10year',
    title: '근속 10년차 장기근속 명예퇴직금 계산기',
    serviceYears: 10,
    monthlySalary: 6000000,
    description: '10년 장기근속에 따른 법정 퇴직금 6,000만 원 기준 세금 감면 혜택 및 IRP 절세 플랜을 제공합니다.',
    irpBenefitDescription: '10년 이상 장기근속 퇴직소득공제 최대 적용 및 연금 수령 시 40% 감면 혜택',
  },
  {
    slug: 'service-20year',
    title: '근속 20년차 정년/임원 퇴직금 세금 계산기',
    serviceYears: 20,
    monthlySalary: 8500000,
    description: '20년 근속 고액 퇴직금의 누진세율 완화 계산법과 IRP 연금 분할 수령 시 수천만 원 절세 효과를 시뮬레이션합니다.',
    irpBenefitDescription: '일시 수령 대비 IRP 연금 분할 수령 시 40% 세금 절감',
  },
];

export const PENSION_TAX_SCENARIOS: PensionTaxScenario[] = [
  {
    slug: 'pension-300m',
    title: '연 300만원 연금저축 세액공제 환급금',
    annualSalary: 50000000,
    pensionDeposit: 3000000,
    irpDeposit: 0,
    description: '총급여 5,500만원 이하 직장인이 연 300만원 저축 시 16.5% 세액공제로 49만 5천원을 13월의 월급으로 돌려받습니다.',
  },
  {
    slug: 'pension-600m',
    title: '연 600만원 연금저축 전액 한도 세액공제',
    annualSalary: 50000000,
    pensionDeposit: 6000000,
    irpDeposit: 0,
    description: '연금저축 단독 한도 600만원을 꽉 채웠을 때 16.5% 공제로 99만원을 전액 환급받는 핵심 시나리오입니다.',
  },
  {
    slug: 'pension-900m-max',
    title: '연금저축+IRP 900만원 풀한도 최대 환급액(148.5만원)',
    annualSalary: 50000000,
    pensionDeposit: 6000000,
    irpDeposit: 3000000,
    description: '연금저축 600만원 + IRP 300만원 합산 900만원 납입 시 연말정산 최대 환급액인 148만 5천원을 산출합니다.',
  },
  {
    slug: 'pension-high-income',
    title: '연봉 5,500만원 초과 고소득자 연금저축 공제액',
    annualSalary: 70000000,
    pensionDeposit: 6000000,
    irpDeposit: 3000000,
    description: '총급여 5,500만원 초과 시 공제율 13.2%가 적용되어 900만원 납입 시 118만 8천원을 환급받는 시뮬레이션입니다.',
  },
];

export const ISA_SCENARIOS: IsaScenario[] = [
  {
    slug: 'isa-general-200m',
    title: 'ISA 일반형 200만원 비과세 한도 절세 계산',
    type: 'general',
    annualProfit: 2000000,
    description: '의무가입기간 3년 유지 시 일반 금융소득세(15.4%) 면제로 30만 8천원의 세금을 전액 절약합니다.',
  },
  {
    slug: 'isa-frugal-400m',
    title: 'ISA 서민형 400만원 비과세 한도 절세 계산',
    type: 'frugal',
    annualProfit: 4000000,
    description: '총급여 5,000만원 이하 서민형 가입 시 400만원까지 비과세되어 61만 6천원의 세금을 100% 절감합니다.',
  },
  {
    slug: 'isa-profit-1000m',
    title: 'ISA 순수익 1,000만원 달성 시 9.9% 분리과세 계산',
    type: 'general',
    annualProfit: 10000000,
    description: '비과세 한도 200만원 초과분에 대해 일반 15.4% 대신 9.9% 저율 분리과세가 적용되어 종합소득세 합산 없이 44만원을 추가 절세합니다.',
  },
];
