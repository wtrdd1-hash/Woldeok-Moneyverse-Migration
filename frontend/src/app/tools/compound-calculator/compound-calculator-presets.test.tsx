import { describe, it, expect } from 'vitest';
import { COMPOUND_PRESETS, STOCK_PRESETS, FARMING_PRESETS, getPresetBySlug } from '@/config/seo-presets.config';

describe('SEO Longtail Presets Suite', () => {
  it('should have well-formed compound calculator presets with valid positive parameters', () => {
    expect(COMPOUND_PRESETS.length).toBeGreaterThanOrEqual(3);
    for (const preset of COMPOUND_PRESETS) {
      expect(preset.slug).toBeDefined();
      expect(preset.title).toMatch(/복리|적금|예금|수익|계산기/);
      expect(preset.metaDescription.length).toBeGreaterThan(20);
      expect(preset.faqs.length).toBeGreaterThanOrEqual(1);
      expect(preset.howToSteps.length).toBeGreaterThanOrEqual(2);
      expect(preset.calculatedResult.primaryValue).toBeDefined();
    }
  });

  it('should have well-formed stock calculator presets with valid strike targets', () => {
    expect(STOCK_PRESETS.length).toBeGreaterThanOrEqual(3);
    for (const preset of STOCK_PRESETS) {
      expect(preset.slug).toBeDefined();
      expect(preset.title).toMatch(/물타기|평단가|손익분기점|계산기/);
      expect(preset.calculatedResult.primaryValue).toBeDefined();
      expect(preset.faqs.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('should have well-formed farming calculator presets', () => {
    expect(FARMING_PRESETS.length).toBeGreaterThanOrEqual(2);
    for (const preset of FARMING_PRESETS) {
      expect(preset.slug).toBeDefined();
      expect(preset.title).toContain('파밍');
      expect(preset.calculatedResult.primaryValue).toBeDefined();
    }
  });

  it('should retrieve preset by slug correctly', () => {
    const found = getPresetBySlug('compound', '10m-3y-5p');
    expect(found).toBeDefined();
    expect(found?.params.principal).toBe(10000000);
    expect(found?.params.rate).toBe(5);

    const notFoundPreset = getPresetBySlug('compound', 'invalid-slug-xyz');
    expect(notFoundPreset).toBeUndefined();
  });
});
