export interface RealEstateCalcInput {
  purchasePrice: number; // 매매가 (원)
  deposit: number; // 임대 보증금 (원)
  monthlyRent: number; // 월세 (원)
  loanAmount: number; // 대출금 (원)
  loanInterestRate: number; // 연 대출금리 (%)
  acquisitionTaxRate: number; // 취득세율 (%)
  annualMaintenanceExpense: number; // 연간 재산세/관리유지비 (원)
}

export interface RealEstateCalcResult {
  totalPurchaseCost: number; // 총 취득원가 (매매가 + 취득세)
  acquisitionTax: number; // 취득세 금액
  actualInvestedCapital: number; // 실투자금 (총취득원가 - 보증금 - 대출금)
  annualGrossRent: number; // 연간 총 임대료 (월세 * 12)
  annualLoanInterest: number; // 연간 대출 이자
  annualNetIncome: number; // 연간 순수익 (연간 총임대료 - 연간 이자 - 연간 유지비)
  monthlyNetCashFlow: number; // 월 순현금흐름 (월세 - 월이자 - 월유지비)
  netCapRate: number; // 무대출 순수익률 (% = 연간 월세/총매수가)
  leveragedRoe: number; // 자기자본 수익률 (% = 연간 순수익/실투자금)
  paybackYears: number; // 원금 회수 기간 (실투자금 / 연간 순수익)
  grade: 'S' | 'A' | 'B' | 'C';
  summaryNote: string;
}

export function calculateRealEstateYield(input: RealEstateCalcInput): RealEstateCalcResult {
  const purchasePrice = Math.max(0, input.purchasePrice);
  const deposit = Math.max(0, input.deposit);
  const monthlyRent = Math.max(0, input.monthlyRent);
  const loanAmount = Math.max(0, input.loanAmount);
  const loanInterestRate = Math.max(0, input.loanInterestRate);
  const acquisitionTaxRate = Math.max(0, input.acquisitionTaxRate);
  const annualMaintenance = Math.max(0, input.annualMaintenanceExpense);

  const acquisitionTax = Math.round(purchasePrice * (acquisitionTaxRate / 100));
  const totalPurchaseCost = purchasePrice + acquisitionTax;

  // 실투자금 = 총매수원가 - 임대보증금 - 대출금
  const actualInvestedCapital = Math.max(1, totalPurchaseCost - deposit - loanAmount);

  // 연간 총 임대료
  const annualGrossRent = monthlyRent * 12;

  // 연간 대출 이자
  const annualLoanInterest = Math.round(loanAmount * (loanInterestRate / 100));

  // 연간 순수익 = 연간 총임대료 - 연간 이자 - 연간 유지비/재산세
  const annualNetIncome = annualGrossRent - annualLoanInterest - annualMaintenance;

  // 월 순수익
  const monthlyNetCashFlow = Math.round(annualNetIncome / 12);

  // 무대출 Cap Rate (%)
  const netCapRate = totalPurchaseCost > 0
    ? Number((((annualGrossRent - annualMaintenance) / totalPurchaseCost) * 100).toFixed(2))
    : 0;

  // 레버리지 ROE (%)
  const leveragedRoe = actualInvestedCapital > 0
    ? Number(((annualNetIncome / actualInvestedCapital) * 100).toFixed(2))
    : 0;

  // 회수 기간 (연)
  const paybackYears = annualNetIncome > 0
    ? Number((actualInvestedCapital / annualNetIncome).toFixed(1))
    : 99.9;

  let grade: 'S' | 'A' | 'B' | 'C' = 'B';
  let summaryNote = '';

  if (leveragedRoe >= 10.0) {
    grade = 'S';
    summaryNote = `연 ${leveragedRoe}%의 압도적 레버리지 수익률로 매월 ${monthlyNetCashFlow.toLocaleString()}원의 안정적인 순수익을 창출하는 초우량 임대 모델입니다.`;
  } else if (leveragedRoe >= 6.5) {
    grade = 'A';
    summaryNote = `연 ${leveragedRoe}%의 견고한 자기자본 수익률로 대출 이자를 제하고도 매월 ${monthlyNetCashFlow.toLocaleString()}원의 플러스 현금흐름이 발생합니다.`;
  } else if (leveragedRoe >= 3.5) {
    grade = 'B';
    summaryNote = `연 ${leveragedRoe}%의 표준적인 임대 수익 모델입니다. 금리 변동에 따른 이자 리스크 관리가 권장됩니다.`;
  } else {
    grade = 'C';
    summaryNote = `수익률이 연 ${leveragedRoe}%로 낮거나 대출 이자 부담이 큽니다. 매입가 협상 또는 보증금/월세 비율 조정을 추천합니다.`;
  }

  return {
    totalPurchaseCost,
    acquisitionTax,
    actualInvestedCapital,
    annualGrossRent,
    annualLoanInterest,
    annualNetIncome,
    monthlyNetCashFlow,
    netCapRate,
    leveragedRoe,
    paybackYears,
    grade,
    summaryNote,
  };
}
