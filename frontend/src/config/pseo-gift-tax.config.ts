export interface GiftTaxPreset {
  readonly slug: string;
  readonly title: string;
  readonly giver: '배우자' | '부모(성인자녀)' | '부모(미성년자녀)' | '혼인·출산' | '기타친족';
  readonly giftAmount: number; // 증여 재산가액 (원)
  readonly deductionAmount: number; // 증여재산 기본공제액 (원)
  readonly descriptionKo: string;
}

export const GIFT_TAX_DEDUCTIONS = {
  배우자: 600000000, // 6억원
  '부모(성인자녀)': 50000000, // 5,000만원
  '부모(미성년자녀)': 20000000, // 2,000만원
  '혼인·출산': 150000000, // 기본 5,000만 + 혼인출산특례 1억 = 1.5억원
  기타친족: 10000000, // 1,000만원
} as const;

/**
 * 2026년 기준 상속세 및 증여세법 누진세율 및 산출세액 계산
 * - 1억원 이하: 10% (누진공제 0)
 * - 5억원 이하: 20% (누진공제 1,000만원)
 * - 10억원 이하: 30% (누진공제 6,000만원)
 * - 30억원 이하: 40% (누진공제 1억 6,000만원)
 * - 30억원 초과: 50% (누진공제 4억 6,000만원)
 * - 신고세액공제: 3% 차감
 */
export function calculateGiftTax(giftAmount: number, deductionAmount: number) {
  const taxableBase = Math.max(0, giftAmount - deductionAmount);

  let rate = 0;
  let progressiveDeduction = 0;

  if (taxableBase <= 100000000) {
    rate = 10;
    progressiveDeduction = 0;
  } else if (taxableBase <= 500000000) {
    rate = 20;
    progressiveDeduction = 10000000;
  } else if (taxableBase <= 1000000000) {
    rate = 30;
    progressiveDeduction = 60000000;
  } else if (taxableBase <= 3000000000) {
    rate = 40;
    progressiveDeduction = 160000000;
  } else {
    rate = 50;
    progressiveDeduction = 460000000;
  }

  const calculatedTax = Math.max(0, Math.floor((taxableBase * (rate / 100)) - progressiveDeduction));
  // 자진신고 세액공제 3%
  const reportDeduction = Math.floor(calculatedTax * 0.03);
  const finalTax = Math.max(0, calculatedTax - reportDeduction);

  return {
    giftAmount,
    deductionAmount,
    taxableBase,
    rate,
    progressiveDeduction,
    calculatedTax,
    reportDeduction,
    finalTax,
    effectiveTaxRate: giftAmount > 0 ? ((finalTax / giftAmount) * 100).toFixed(2) : '0.00',
  };
}

export const GIFT_TAX_PRESETS: readonly GiftTaxPreset[] = [
  // 성인 자녀 증여
  {
    slug: 'parents-to-adult-child-50m',
    title: '부모가 성인 자녀에게 5천만원 증여 시 세금',
    giver: '부모(성인자녀)',
    giftAmount: 50000000,
    deductionAmount: 50000000,
    descriptionKo: '성인 자녀 10년간 5천만원 증여공제 한도 적용 시 증여세 0원 비과세.',
  },
  {
    slug: 'parents-to-adult-child-100m',
    title: '부모가 성인 자녀에게 1억원 증여 시 세금',
    giver: '부모(성인자녀)',
    giftAmount: 100000000,
    deductionAmount: 50000000,
    descriptionKo: '5천만원 공제 후 과세표준 5천만원에 대해 10% 세율 적용, 자진신고 3% 공제 시 약 485만원 납부.',
  },
  {
    slug: 'parents-to-adult-child-200m',
    title: '부모가 성인 자녀에게 2억원 증여 시 세금',
    giver: '부모(성인자녀)',
    giftAmount: 200000000,
    deductionAmount: 50000000,
    descriptionKo: '5천만원 공제 후 과세표준 1.5억원(20% 구간), 누진공제 1,000만원 차감 후 약 1,940만원 납부.',
  },
  {
    slug: 'parents-to-adult-child-300m',
    title: '부모가 성인 자녀에게 3억원 증여 시 세금',
    giver: '부모(성인자녀)',
    giftAmount: 300000000,
    deductionAmount: 50000000,
    descriptionKo: '과세표준 2.5억원(20% 구간), 누진공제 및 신고세액공제 적용 시 실부담 세금 정밀 계산.',
  },
  {
    slug: 'parents-to-adult-child-500m',
    title: '부모가 성인 자녀에게 5억원 아파트·현금 증여 시 세금',
    giver: '부모(성인자녀)',
    giftAmount: 500000000,
    deductionAmount: 50000000,
    descriptionKo: '과세표준 4.5억원, 20% 세율 적용 시 증여세 산출세액 약 7,760만원.',
  },

  // 혼인·출산 특례 증여
  {
    slug: 'marriage-gift-150m',
    title: '신혼부부 결혼·혼인 증여세 1억5천만원 비과세',
    giver: '혼인·출산',
    giftAmount: 150000000,
    deductionAmount: 150000000,
    descriptionKo: '혼인신고 전후 2년 내 부모 증여 시 기본 5천만 + 혼인특례 1억 = 1.5억원까지 전액 비과세 0원.',
  },
  {
    slug: 'marriage-gift-300m',
    title: '신혼부부 양가 부모 합산 3억원 증여세 비과세',
    giver: '혼인·출산',
    giftAmount: 300000000,
    deductionAmount: 300000000,
    descriptionKo: '신랑측 부모 1.5억 + 신부측 부모 1.5억 합산 시 총 3억원까지 증여세 0원 완벽 절세 플랜.',
  },
  {
    slug: 'childbirth-gift-150m',
    title: '출산·자녀 출생 증여재산 공제 1억5천만원 계산',
    giver: '혼인·출산',
    giftAmount: 150000000,
    deductionAmount: 150000000,
    descriptionKo: '자녀 출생 후 2년 내 직계존속 증여 시 1억원 특례 공제 혜택 총정리.',
  },

  // 미성년 자녀 증여
  {
    slug: 'minor-child-20m',
    title: '미성년 자녀 2천만원 주식·적금 증여 시 세금',
    giver: '부모(미성년자녀)',
    giftAmount: 20000000,
    deductionAmount: 20000000,
    descriptionKo: '10년 주기 2천만원 비과세 한도 활용 자녀 미국주식/국내주식 조기 증여 플랜.',
  },
  {
    slug: 'minor-child-50m',
    title: '미성년 자녀 5천만원 증여 시 세금',
    giver: '부모(미성년자녀)',
    giftAmount: 50000000,
    deductionAmount: 20000000,
    descriptionKo: '2천만원 공제 후 과세표준 3천만원에 10% 세율 적용, 실부담세액 약 291만원.',
  },
  {
    slug: 'minor-child-100m',
    title: '미성년 자녀 1억원 증여 시 세금',
    giver: '부모(미성년자녀)',
    giftAmount: 100000000,
    deductionAmount: 20000000,
    descriptionKo: '2천만원 공제 후 과세표준 8천만원에 10% 세율 적용, 실부담세액 약 776만원.',
  },

  // 배우자 증여
  {
    slug: 'spouse-gift-600m',
    title: '배우자 간 6억원 아파트 공동명의 증여 시 세금',
    giver: '배우자',
    giftAmount: 600000000,
    deductionAmount: 600000000,
    descriptionKo: '배우자 증여재산공제 10년간 6억원 전액 비과세 혜택, 종합부동산세 및 양도세 절세 전략.',
  },
  {
    slug: 'spouse-gift-1000m',
    title: '배우자 간 10억원 부동산 증여 시 세금',
    giver: '배우자',
    giftAmount: 1000000000,
    deductionAmount: 600000000,
    descriptionKo: '6억원 공제 후 과세표준 4억원에 대해 20% 세율 적용, 최종 세금 약 6,790만원.',
  },
];
