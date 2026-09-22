import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { OverrideUserAssetDto } from './economy.controller';

const validOverride = {
  assetType: 'cash',
  amount: '1000',
  direction: 'credit_grant',
  reason: 'manual correction',
  idempotencyKey: '8f47b6d4-93d2-4a30-8f0a-68d86ca7ad35',
} as const;

function errors(body: Record<string, unknown>) {
  return validateSync(plainToInstance(OverrideUserAssetDto, body));
}

describe('admin economy idempotency contract', () => {
  it('requires a caller-owned UUID for asset overrides', () => {
    expect(errors(validOverride)).toHaveLength(0);
    const { idempotencyKey: _omitted, ...withoutKey } = validOverride;
    expect(errors(withoutKey).some((error) => error.property === 'idempotencyKey')).toBe(true);
  });

  it('rejects malformed asset-override idempotency keys', () => {
    expect(errors({ ...validOverride, idempotencyKey: 'retry-me' }).some((error) => error.property === 'idempotencyKey')).toBe(true);
  });
});