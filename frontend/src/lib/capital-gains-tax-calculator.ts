export interface CapitalGainsTaxInput {
  realizedGainKrw: number; // 실현 수익 (원)
  unrealizedLossKrw?: number; // 손실 종목 금액 (원)
  applyLossHarvesting?: boolean; // 손실 상계 매도 여부
  applyBasicDeduction?: boolean; // 연 250만원 기본공제 적용 여부
  applySpouseGiftDeduction?: boolean; // Deprecated input: never reduces capital-gains tax.
  spouseGiftDeductionAmount?: number; // Deprecated gift-tax allowance, not a capital-gains deduction.
  customTaxRate?: number; // 기본 22% (양도세 20% + 지방세 2%)
}

export interface CapitalGainsTaxResult {
  grossGainKrw: number; // 총 실현 차익
  lossHarvestingDeduction: number; // 손실 상계 차감액
  basicDeductionAmount: number; // 기본공제 적용액 (250만원 한도)
  spouseGiftDeduction: number; // Always zero: gift-tax allowance is not a capital-gains deduction.
  taxableBaseKrw: number; // 과세표준 (수익 - 실현손실 가정 - 기본공제)
  nationalTaxKrw: number; // 양도소득세 (20%)
  localTaxKrw: number; // 지방소득세 (2%)
  totalTaxPayableKrw: number; // 총 납부 세액 (22%)
  taxSavedByLossHarvesting: number; // 손실 상계로 아낀 세금
  taxSavedByBasicDeduction: number; // 기본공제로 아낀 세금
  effectiveTaxRate: number; // 실효 세율 (%)
  netProfitAfterTaxKrw: number; // 세후 실수령 순수익
  adviceNotes: string[];
}

export function calculateCapitalGainsTax(input: CapitalGainsTaxInput): CapitalGainsTaxResult {
  const grossGain = Math.max(0, input.realizedGainKrw);
  const rawLoss = Math.max(0, input.unrealizedLossKrw ?? 0);
  const applyLoss = input.applyLossHarvesting ?? false;
  const applyBasic = input.applyBasicDeduction ?? true;

  // 1. 손실 상계 적용액
  const lossHarvestingDeduction = applyLoss ? Math.min(grossGain, rawLoss) : 0;
  const gainAfterLoss = grossGain - lossHarvestingDeduction;

  // Gift-tax allowances cannot be subtracted from a stock capital gain.
  const spouseGiftDeduction = 0;

  // Apply the annual basic deduction after the assumed realized loss.
  const basicDeductionAmount = applyBasic ? Math.min(gainAfterLoss, 2500000) : 0;
  const taxableBaseKrw = Math.max(0, gainAfterLoss - basicDeductionAmount);

  // 5. 세액 계산 (20% 국세 + 2% 지방세 = 22%)
  const nationalTaxKrw = Math.round(taxableBaseKrw * 0.20);
  const localTaxKrw = Math.round(taxableBaseKrw * 0.02);
  const totalTaxPayableKrw = nationalTaxKrw + localTaxKrw;

  // 6. 절세 혜택 계산
  const baselineTaxable = Math.max(0, grossGain - (applyBasic ? Math.min(grossGain, 2500000) : 0));
  const baselineTax = Math.round(baselineTaxable * 0.20) + Math.round(baselineTaxable * 0.02);
  const taxSavedByLossHarvesting = applyLoss ? Math.max(0, baselineTax - totalTaxPayableKrw) : 0;
  const withoutBasicTax = Math.round(gainAfterLoss * 0.20) + Math.round(gainAfterLoss * 0.02);
  const taxSavedByBasicDeduction = applyBasic ? Math.max(0, withoutBasicTax - totalTaxPayableKrw) : 0;

  // 7. 실효세율 및 세후 순수익
  const effectiveTaxRate = grossGain > 0
    ? Number(((totalTaxPayableKrw / grossGain) * 100).toFixed(2))
    : 0;

  const netProfitAfterTaxKrw = grossGain - totalTaxPayableKrw;

  const adviceNotes: string[] = [];

  if (taxableBaseKrw === 0) {
    adviceNotes.push('입력한 가정에서 예상 과세표준은 0원입니다. 실제 신고 세액은 다른 거래·비용·세법 적용에 따라 달라질 수 있습니다.');
  } else {
    adviceNotes.push(`예상 납부 세액은 ${totalTaxPayableKrw.toLocaleString()}원 (실효세율 ${effectiveTaxRate}%)입니다.`);
  }

  if (rawLoss > 0 && !applyLoss) {
    adviceNotes.push(`보유 중인 평가손실 ${rawLoss.toLocaleString()}원은 매도해 실현하기 전에는 손익통산 대상이 아닙니다. 동일 과세연도 실현 여부와 적용 요건을 확인하세요.`);
  }

  if (applyLoss) {
    adviceNotes.push(`가정한 손실 매도가 실제로 성립하고 요건을 충족할 경우, 동일 기본공제 조건 대비 예상 세액 차이는 ${taxSavedByLossHarvesting.toLocaleString()}원입니다.`);
  }

  adviceNotes.push('신고·납부 기한과 적용 세율은 귀속연도 및 개별 사정에 따라 국세청 최신 안내를 확인하세요. 배우자 증여재산공제는 양도차익에서 직접 차감되지 않습니다.');

  return {
    grossGainKrw: grossGain,
    lossHarvestingDeduction,
    basicDeductionAmount,
    spouseGiftDeduction,
    taxableBaseKrw,
    nationalTaxKrw,
    localTaxKrw,
    totalTaxPayableKrw,
    taxSavedByLossHarvesting,
    taxSavedByBasicDeduction,
    effectiveTaxRate,
    netProfitAfterTaxKrw,
    adviceNotes,
  };
}
