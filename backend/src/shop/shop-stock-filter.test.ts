import { describe, expect, it } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { filterCatalogByStock } from './shop-stock-filter';

const items = [
  { code: 'unlimited', quantity: null, price: '9007199254740993' },
  { code: 'available', quantity: 2, price: '10' },
  { code: 'sold_out', quantity: 0, price: '1' },
];

describe('shop available-stock query', () => {
  it('defaults to the entire database-authorized catalogue', () => {
    expect(filterCatalogByStock(items)).toEqual(items);
    expect(filterCatalogByStock(items, 'all')).toEqual(items);
  });
  it('keeps unlimited and positive-stock listings without changing exact prices', () => {
    expect(filterCatalogByStock(items, 'available')).toEqual(items.slice(0, 2));
    expect(filterCatalogByStock(items, 'available')[0]?.price).toBe('9007199254740993');
  });
  it('rejects unsupported values instead of silently weakening the filter', () => {
    expect(() => filterCatalogByStock(items, 'sold_out')).toThrow(BadRequestException);
    expect(() => filterCatalogByStock(items, 'AVAILABLE')).toThrow(BadRequestException);
  });
});
