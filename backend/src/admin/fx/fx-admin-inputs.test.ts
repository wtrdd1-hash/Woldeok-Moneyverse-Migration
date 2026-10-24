import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { describe, expect, it } from 'vitest';
import {
  FxInterventionDto,
  FxSwapDrawdownDto,
  FxForwardSettleDto,
  FxHaltDto,
} from './fx.controller';

const id = 'b00c58a5-1bce-43bd-bb5b-080cd671e22d';

function valid<T extends object>(cls: new () => T, value: object): boolean {
  return validateSync(plainToInstance(cls, value)).length === 0;
}

describe('FX administrator input contract', () => {
  it('refuses invalid intervention type, fractional, infinite, and excessive amounts', () => {
    expect(valid(FxInterventionDto, { type: 'BUY_USD', amountUsd: 50000 })).toBe(true);
    for (const value of [-1, 0, 0.5, 1_000_000_001, '50000', 'Infinity']) {
      expect(valid(FxInterventionDto, { type: 'SELL_USD', amountUsd: value })).toBe(false);
    }
    expect(valid(FxInterventionDto, { type: 'DELETE', amountUsd: 1 })).toBe(false);
  });

  it('requires an agreement UUID and a positive bounded integer swap draw', () => {
    expect(valid(FxSwapDrawdownDto, { agreementId: id, amountUsd: 1000 })).toBe(true);
    expect(valid(FxSwapDrawdownDto, { agreementId: 'bad', amountUsd: 1000 })).toBe(false);
    expect(valid(FxSwapDrawdownDto, { agreementId: id, amountUsd: Number.MAX_SAFE_INTEGER })).toBe(false);
  });

  it('refuses an invalid forward contract id and a non-boolean halt', () => {
    expect(valid(FxForwardSettleDto, { contractId: id })).toBe(true);
    expect(valid(FxForwardSettleDto, { contractId: '../other' })).toBe(false);
    expect(valid(FxHaltDto, { isHalted: false })).toBe(true);
    expect(valid(FxHaltDto, { isHalted: 'false' })).toBe(false);
  });
});
