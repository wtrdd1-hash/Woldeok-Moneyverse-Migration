import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CAPITAL_GAINS_TAX_PRESETS } from '@/config/capital-gains-tax-presets.config';
import { calculateCapitalGainsTax } from './capital-gains-tax-calculator';

describe('overseas stock capital gains tax truthfulness', () => {
  it('never subtracts a spouse gift-tax allowance from capital-gains profit', () => {
    const result = calculateCapitalGainsTax({
      realizedGainKrw: 50_000_000,
      applyBasicDeduction: true,
      applySpouseGiftDeduction: true,
      spouseGiftDeductionAmount: 600_000_000,
    });
    expect(result.spouseGiftDeduction).toBe(0);
    expect(result.taxableBaseKrw).toBe(47_500_000);
    expect(result.totalTaxPayableKrw).toBe(10_450_000);
  });

  it('does not overstate a loss scenario saving when the basic deduction already covers part of the gain', () => {
    const result = calculateCapitalGainsTax({
      realizedGainKrw: 3_000_000,
      unrealizedLossKrw: 1_000_000,
      applyLossHarvesting: true,
      applyBasicDeduction: true,
    });
    expect(result.totalTaxPayableKrw).toBe(0);
    expect(result.taxSavedByLossHarvesting).toBe(110_000);
    expect(result.adviceNotes.join(' ')).not.toContain('성공적으로 절감');
  });

  it('does not promise a definitive exemption or a universal filing deadline', () => {
    const result = calculateCapitalGainsTax({ realizedGainKrw: 2_500_000 });
    expect(result.adviceNotes.join(' ')).not.toContain('전액 비과세');
    expect(result.adviceNotes.join(' ')).not.toContain('매년 5월 1일 ~ 5월 31일');
  });

  it('removes the unsupported spouse deduction toggle and warns on the legacy preset', () => {
    const source = readFileSync(new URL('../components/capital-gains-tax-calculator-view.tsx', import.meta.url), 'utf8');
    expect(source).not.toContain('id="spouseGift"');
    expect(source).toContain('htmlFor="realized-gain"');
    expect(source).toContain('htmlFor="unrealized-loss"');
    expect(source).toContain('aria-live="polite"');
    const preset = CAPITAL_GAINS_TAX_PRESETS.find((p) => p.slug === 'spouse-gift-600m');
    expect(preset?.description).toContain('양도차익에서 직접 차감되지');
  });
});
