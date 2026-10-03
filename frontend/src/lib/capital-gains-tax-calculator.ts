export interface CapitalGainsTaxInput {
  realizedGainKrw: number; // 실현 수익 (원)
  unrealizedLossKrw?: number; // 손실 종목 금액 (원)
  applyLossHarvesting?: boolean; // 손실 상계 매도 여부
  applyBasicDeduction?: boolean; // 연 250만원 기본공제 적용 여부
  applySpouseGiftDeduction?: boolean; // 배우자 증여(취득가액 증액) 활용 여부
  spouseGiftDeductionAmount?: number; // 배우자 증여 공제액 (최대 6억원)
  customTaxRate?: number; // 기본 22% (양도세 20% + 지방세 2%)
}

export interface CapitalGainsTaxResult {
  grossGainKrw: number; // 총 실현 차익
  lossHarvestingDeduction: number; // 손실 상계 차감액
  basicDeductionAmount: number; // 기본공제 적용액 (250만원 한도)
  spouseGiftDeduction: number; // 배우자 증여 적용 차감액
  taxableBaseKrw: number; // 과세표준 (수익 - 손실상계 - 증여공제 - 기본공제)
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
  const applySpouse = input.applySpouseGiftDeduction ?? false;
  const spouseAmount = Math.max(0, input.spouseGiftDeductionAmount ?? 600000000);
  const taxRate = input.customTaxRate ?? 22;

  // 1. 손실 상계 적용액
  const lossHarvestingDeduction = applyLoss ? Math.min(grossGain, rawLoss) : 0;
  const gainAfterLoss = grossGain - lossHarvestingDeduction;

  // 2. 배우자 증여 차감액
  const spouseGiftDeduction = applySpouse ? Math.min(gainAfterLoss, spouseAmount) : 0;
  const gainAfterSpouse = gainAfterLoss - spouseGiftDeduction;

  // 3. 연간 기본공제 (250만원)
  const basicDeductionAmount = applyBasic ? Math.min(gainAfterSpouse, 2500000) : 0;

  // 4. 과세표준
  const taxableBaseKrw = Math.max(0, gainAfterSpouse - basicDeductionAmount);

  // 5. 세액 계산 (20% 국세 + 2% 지방세 = 22%)
  const nationalTaxKrw = Math.round(taxableBaseKrw * 0.20);
  const localTaxKrw = Math.round(taxableBaseKrw * 0.02);
  const totalTaxPayableKrw = nationalTaxKrw + localTaxKrw;

  // 6. 절세 혜택 계산
  const taxSavedByLossHarvesting = Math.round(lossHarvestingDeduction * (taxRate / 100));
  const taxSavedByBasicDeduction = Math.round(basicDeductionAmount * (taxRate / 100));

  // 7. 실효세율 및 세후 순수익
  const effectiveTaxRate = grossGain > 0
    ? Number(((totalTaxPayableKrw / grossGain) * 100).toFixed(2))
    : 0;

  const netProfitAfterTaxKrw = grossGain - totalTaxPayableKrw;

  const adviceNotes: string[] = [];

  if (taxableBaseKrw === 0) {
    adviceNotes.push('🎉 과세표준이 0원이므로 납부할 양도소득세는 0원(전액 비과세)입니다.');
  } else {
    adviceNotes.push(`예상 납부 세액은 ${totalTaxPayableKrw.toLocaleString()}원 (실효세율 ${effectiveTaxRate}%)입니다.`);
  }

  if (rawLoss > 0 && !applyLoss) {
    const potentialSaving = Math.round(Math.min(taxableBaseKrw, rawLoss) * 0.22);
    if (potentialSaving > 0) {
      adviceNotes.push(`💡 보유 중인 손실 종목(${rawLoss.toLocaleString()}원)을 연내 동시 매도하면 최대 ${potentialSaving.toLocaleString()}원의 세금을 즉시 아낄 수 있습니다.`);
    }
  }

  if (applyLoss) {
    adviceNotes.push(`✅ 손익 상계를 통해 ${taxSavedByLossHarvesting.toLocaleString()}원의 세금을 성공적으로 절감했습니다.`);
  }

  adviceNotes.push('📅 해외주식 양도소득세는 매년 5월 1일 ~ 5월 31일 홈택스에서 신고 및 납부합니다.');

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
