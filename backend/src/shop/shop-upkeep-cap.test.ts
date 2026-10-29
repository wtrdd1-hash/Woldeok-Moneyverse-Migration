import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { filterShopUpkeep } from './shop-upkeep-cap';

const items = [
  { code: 'free', maintenance_cost: '0' },
  { code: 'low', maintenance_cost: '250' },
  { code: 'huge', maintenance_cost: '900719925474099300000' },
] as const;

describe('shop weekly upkeep ceiling', () => {
  it('keeps the catalogue unchanged when the query is omitted or blank', () => {
    expect(filterShopUpkeep(items)).toEqual(items);
    expect(filterShopUpkeep(items, '')).toEqual(items);
  });
  it('accepts zero as free-upkeep only and exact large integer boundaries', () => {
    expect(filterShopUpkeep(items, '0').map((row) => row.code)).toEqual(['free']);
    expect(filterShopUpkeep(items, '250').map((row) => row.code)).toEqual(['free', 'low']);
    expect(filterShopUpkeep(items, '900719925474099299999').map((row) => row.code)).toEqual([
      'free',
      'low',
    ]);
    expect(filterShopUpkeep(items, '900719925474099300000')).toEqual(items);
  });
  it.each(['-1', '+1', ' 1', '1 ', '01', '1.5', '1e3', 'NaN', '９', '1'.repeat(31)])(
    'rejects noncanonical or oversized ceiling %s',
    (input) => expect(() => filterShopUpkeep(items, input)).toThrow(BadRequestException),
  );
  it('fails closed on invalid database upkeep rather than claiming a matching product', () => {
    expect(() => filterShopUpkeep([{ maintenance_cost: '1.2' }], '10')).toThrow(/database/i);
    expect(() => filterShopUpkeep([{ maintenance_cost: -1 }], '10')).toThrow(/database/i);
  });
});
