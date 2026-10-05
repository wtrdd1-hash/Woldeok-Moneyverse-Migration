export interface SalaryPresetData {
  slug: string;
  annualSalary: number; // 원 단위 (예: 50,000,000)
  displayTitle: string;
  monthlyGross: number; // 월 세전 급여
  nationalPension: number; // 국민연금 (4.5%, 상한 적용)
  healthInsurance: number; // 건강보험 (3.545%)
  longTermCare: number; // 장기요양보험 (건강보험의 12.95%)
  employmentInsurance: number; // 고용보험 (0.9%)
  incomeTax: number; // 근로소득세
  localIncomeTax: number; // 지방소득세 (근로소득세 10%)
  totalDeduction: number; // 총 공제액
  monthlyNet: number; // 월 실수령액
  annualNet: number; // 연간 실수령액
  effectiveTaxRate: string; // 실효 공제율 (%)
  faqList: { question: string; answer: string }[];
}

export function calculateSalaryBreakdown(annualSalary: number): Omit<SalaryPresetData, 'slug' | 'displayTitle' | 'faqList'> {
  const monthlyGross = Math.round(annualSalary / 12);

  // 국민연금: 4.5% (상한액 월 6,170,000원 기준 최대 277,650원)
  const pensionBase = Math.min(monthlyGross, 6170000);
  const nationalPension = Math.round(pensionBase * 0.045);

  // 건강보험: 3.545%
  const healthInsurance = Math.round(monthlyGross * 0.03545);

  // 장기요양보험: 건강보험의 12.95%
  const longTermCare = Math.round(healthInsurance * 0.1295);

  // 고용보험: 0.9%
  const employmentInsurance = Math.round(monthlyGross * 0.009);

  // 근로소득세 (2026 간이세액표 근사 다구간 누진 모델)
  let incomeTax = 0;
  if (annualSalary <= 14000000) {
    incomeTax = Math.round((annualSalary * 0.06) / 12 * 0.4); // 근로소득세액공제 반영
  } else if (annualSalary <= 30000000) {
    incomeTax = Math.round((840000 + (annualSalary - 14000000) * 0.15) / 12 * 0.55);
  } else if (annualSalary <= 50000000) {
    incomeTax = Math.round((3240000 + (annualSalary - 30000000) * 0.15) / 12 * 0.7);
  } else if (annualSalary <= 88000000) {
    incomeTax = Math.round((6240000 + (annualSalary - 50000000) * 0.24) / 12 * 0.85);
  } else if (annualSalary <= 150000000) {
    incomeTax = Math.round((15360000 + (annualSalary - 88000000) * 0.35) / 12 * 0.9);
  } else {
    incomeTax = Math.round((37060000 + (annualSalary - 150000000) * 0.38) / 12 * 0.95);
  }
  incomeTax = Math.max(0, incomeTax);

  // 지방소득세: 근로소득세 10%
  const localIncomeTax = Math.round(incomeTax * 0.1);

  const totalDeduction =
    nationalPension +
    healthInsurance +
    longTermCare +
    employmentInsurance +
    incomeTax +
    localIncomeTax;

  const monthlyNet = Math.max(0, monthlyGross - totalDeduction);
  const annualNet = monthlyNet * 12;
  const effectiveTaxRate = monthlyGross > 0 ? ((totalDeduction / monthlyGross) * 100).toFixed(1) : '0.0';

  return {
    annualSalary,
    monthlyGross,
    nationalPension,
    healthInsurance,
    longTermCare,
    employmentInsurance,
    incomeTax,
    localIncomeTax,
    totalDeduction,
    monthlyNet,
    annualNet,
    effectiveTaxRate,
  };
}

// 2,400만원부터 1억 5,000만원까지의 50개 대표 구간
export const SALARY_AMOUNTS_TABLE = [
  24000000, 26000000, 28000000, 30000000, 32000000, 34000000, 35000000, 36000000, 38000000, 40000000,
  42000000, 44000000, 45000000, 46000000, 48000000, 50000000, 52000000, 54000000, 55000000, 56000000,
  58000000, 60000000, 62000000, 64000000, 65000000, 66000000, 68000000, 70000000, 72000000, 75000000,
  78000000, 80000000, 82000000, 85000000, 88000000, 90000000, 92000000, 95000000, 98000000, 100000000,
  105000000, 110000000, 115000000, 120000000, 125000000, 130000000, 135000000, 140000000, 145000000, 150000000,
];

export const SALARY_PRESETS: readonly SalaryPresetData[] = SALARY_AMOUNTS_TABLE.map((amt) => {
  const inManWon = amt / 10000;
  const inEok = amt >= 100000000 ? `${(amt / 100000000).toFixed(1).replace('.0', '')}억` : `${inManWon}만`;
  const slug = `salary-${inManWon}m`;
  const breakdown = calculateSalaryBreakdown(amt);

  return {
    slug,
    displayTitle: `연봉 ${inEok}원 실수령액 계산기`,
    ...breakdown,
    faqList: [
      {
        question: `연봉 ${inEok}원의 월 세후 실수령액은 얼마인가요?`,
        answer: `연봉 ${inEok}원(월 세전 ${(breakdown.monthlyGross / 10000).toLocaleString()}만원)의 4대 보험 및 소득세 공제 후 월 실수령액은 약 ${breakdown.monthlyNet.toLocaleString()}원입니다. (총 공제액: 월 ${breakdown.totalDeduction.toLocaleString()}원, 실효 공제율: ${breakdown.effectiveTaxRate}%)`,
      },
      {
        question: `연봉 ${inEok}원에서 가장 많이 빠져나가는 공제 항목은 무엇인가요?`,
        answer: `국민연금(${breakdown.nationalPension.toLocaleString()}원), 건강보험(${breakdown.healthInsurance.toLocaleString()}원) 등 4대 보험과 소득세(${breakdown.incomeTax.toLocaleString()}원)가 공제됩니다. 부양가족 수 및 비과세 식대(월 20만원 한도) 여부에 따라 약간의 차이가 발생할 수 있습니다.`,
      },
      {
        question: `실수령액을 늘리거나 절세할 수 있는 방법은 무엇인가요?`,
        answer: `연금저축/IRP 계좌를 개설하여 연 최대 900만원 납입 시 최대 148만 5천원의 세액공제를 환급받거나, ISA 비과세 계좌를 활용하면 실질 실수령 소득을 크게 높일 수 있습니다.`,
      },
    ],
  };
});

export function getSalaryPresetBySlug(slug: string): SalaryPresetData | undefined {
  return SALARY_PRESETS.find((p) => p.slug === slug);
}
