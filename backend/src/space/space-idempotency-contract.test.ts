import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { ContributeCityProjectDto, PurchaseSpaceDto } from './space.controller';

const key = '8f47b6d4-93d2-4a30-8f0a-68d86ca7ad35';

function errors<T extends object>(type: new () => T, body: Record<string, unknown>) {
  return validateSync(plainToInstance(type, body));
}

describe('space economy idempotency contract', () => {
  it('requires a caller-owned UUID for space purchases', () => {
    const valid = { spaceType: 'SPACE_STUDIO', name: 'Studio', idempotencyKey: key };
    expect(errors(PurchaseSpaceDto, valid)).toHaveLength(0);
    const { idempotencyKey: _omitted, ...withoutKey } = valid;
    expect(errors(PurchaseSpaceDto, withoutKey).some((error) => error.property === 'idempotencyKey')).toBe(true);
  });

  it('requires a caller-owned UUID for city-project contributions', () => {
    const valid = { amountWld: 5000, idempotencyKey: key };
    expect(errors(ContributeCityProjectDto, valid)).toHaveLength(0);
    const { idempotencyKey: _omitted, ...withoutKey } = valid;
    expect(errors(ContributeCityProjectDto, withoutKey).some((error) => error.property === 'idempotencyKey')).toBe(true);
  });

  it('rejects malformed idempotency keys', () => {
    expect(errors(PurchaseSpaceDto, { spaceType: 'SPACE_STUDIO', name: 'Studio', idempotencyKey: 'retry-me' }).some((error) => error.property === 'idempotencyKey')).toBe(true);
    expect(errors(ContributeCityProjectDto, { amountWld: 5000, idempotencyKey: 'retry-me' }).some((error) => error.property === 'idempotencyKey')).toBe(true);
  });
});
