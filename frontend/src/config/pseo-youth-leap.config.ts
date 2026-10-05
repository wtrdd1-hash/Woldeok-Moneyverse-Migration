export interface YouthLeapPresetData {
  readonly slug: string;
  readonly title: string;
  readonly monthlyDeposit: number; // 월 납입액 (원)
  readonly annualIncome: number; // 연소득 (원)
  readonly months: number; // 60개월
  readonly baseRate: number; // 연 4.5%
  readonly govContribution: number; // 5년 총 정부 기여금
  readonly totalPrincipal: number; // 5년 본인 납입 원금
  readonly bankInterest: number; // 은행 세전/비과세 이자
  readonly totalPayout: number; // 만기 총 수령액
  readonly yieldPercent: string; // 총 수익률
  readonly badge: string;
  readonly faqList: readonly { readonly question: string; readonly answer: string }[];
}

export const YOUTH_LEAP_PRESETS: readonly YouthLeapPresetData[] = [
  {
    slug: '700k-24m-max',
    title: '월 70만원 연소득 2,400만원 청년도약계좌 5,000만원 만들기',
    monthlyDeposit: 700000,
    annualIncome: 24000000,
    months: 60,
    baseRate: 5.5,
    totalPrincipal: 42000000,
    govContribution: 1980000,
    bankInterest: 6142500,
    totalPayout: 50122500,
    yieldPercent: '19.34%',
    badge: '인기 1위',
    faqList: [
      {
        question: '청년도약계좌 만기 5년 시 총 수령액은 얼마인가요?',
        answer: '월 70만원씩 5년간 납입(총 4,200만원) 시, 정부 기여금 최대 198만원과 비과세 이자 약 614만원이 더해져 약 5,012만원을 수령하게 됩니다.',
      },
      {
        question: '정부 기여금 비과세 혜택의 조건은 무엇인가요?',
        answer: '만 19세~34세 이하 청년 중 개인소득 7,500만원 이하, 가구소득 중위 250% 이하 요건을 충족하면 이자소득세(15.4%)가 전액 비과세됩니다.',
      },
    ],
  },
  {
    slug: '500k-36m-balance',
    title: '월 50만원 연소득 3,600만원 청년도약계좌 3,500만원 시뮬레이터',
    monthlyDeposit: 500000,
    annualIncome: 36000000,
    months: 60,
    baseRate: 5.0,
    totalPrincipal: 30000000,
    govContribution: 1380000,
    bankInterest: 3875000,
    totalPayout: 35255000,
    yieldPercent: '17.52%',
    badge: '추천',
    faqList: [
      {
        question: '월 50만원 납입 시 만기 수령액은 얼마인가요?',
        answer: '본인 납입 원금 3,000만원에 정부 기여금 138만원, 비과세 이자 387.5만원이 더해져 만기 시 약 3,525만원을 수령합니다.',
      },
    ],
  },
  {
    slug: '400k-24m-starter',
    title: '사회초년생 월 40만원 청년도약계좌 3,000만원 목돈 플랜',
    monthlyDeposit: 400000,
    annualIncome: 24000000,
    months: 60,
    baseRate: 5.5,
    totalPrincipal: 24000000,
    govContribution: 1980000,
    bankInterest: 3510000,
    totalPayout: 29490000,
    yieldPercent: '22.88%',
    badge: '사회초년생',
    faqList: [
      {
        question: '월 40만원으로도 정부 기여금을 전액 받을 수 있나요?',
        answer: '연소득 2,400만원 이하 구간은 월 40만원까지만 매칭 기여금(월 3.3만원)이 지급되므로, 가장 가성비 높게 정부 혜택을 챙길 수 있습니다.',
      },
    ],
  },
  {
    slug: '700k-48m-standard',
    title: '월 70만원 연소득 4,800만원 청년도약계좌 실효 수익률 계산기',
    monthlyDeposit: 700000,
    annualIncome: 48000000,
    months: 60,
    baseRate: 5.0,
    totalPrincipal: 42000000,
    govContribution: 1320000,
    bankInterest: 5425000,
    totalPayout: 48745000,
    yieldPercent: '16.06%',
    badge: '표준',
    faqList: [
      {
        question: '연소득 4,800만원 구간의 정부 기여금은 얼마인가요?',
        answer: '월 2.2만원씩 5년간 총 132만원의 정부 기여금이 적립되며, 비과세 이자 혜택을 온전히 누릴 수 있습니다.',
      },
    ],
  },
  {
    slug: '300k-minimal',
    title: '부담 없는 월 30만원 청년도약계좌 소액 저축 플랜',
    monthlyDeposit: 300000,
    annualIncome: 30000000,
    months: 60,
    baseRate: 5.0,
    totalPrincipal: 18000000,
    govContribution: 1260000,
    bankInterest: 2325000,
    totalPayout: 21585000,
    yieldPercent: '19.92%',
    badge: '소액저축',
    faqList: [
      {
        question: '월 30만원 납입 시 만기 해지 예상액은 얼마인가요?',
        answer: '원금 1,800만원에 기여금 126만원과 이자 232.5만원이 붙어 약 2,158만원을 수령합니다.',
      },
    ],
  },
];
