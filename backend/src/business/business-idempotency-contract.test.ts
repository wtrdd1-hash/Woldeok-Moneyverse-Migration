import { validateSync } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { ApplyBoostDto } from './business.controller';

const KEY = '11111111-1111-4111-8111-111111111111';

describe('business boost idempotency contract', () => {
  it('requires a caller-owned UUID for inventory-consuming boost application', () => {
    const missing = Object.assign(new ApplyBoostDto(), { boostCode: 'biz_cvs_boost_7d' });
    expect(validateSync(missing).some((error) => error.property === 'idempotencyKey')).toBe(true);

    const valid = Object.assign(new ApplyBoostDto(), {
      boostCode: 'biz_cvs_boost_7d',
      idempotencyKey: KEY,
    });
    expect(validateSync(valid)).toEqual([]);
  });
});
