import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseBusinessBudget } from './business-budget';

describe('business catalogue budget search', () => {
  it('accepts exact canonical integer WLD values, including beyond JS safe integer', () => {
    expect(parseBusinessBudget(undefined)).toEqual({ value: null, invalid: false });
    expect(parseBusinessBudget('0')).toEqual({ value: '0', invalid: false });
    expect(parseBusinessBudget('9007199254740993')).toEqual({ value: '9007199254740993', invalid: false });
  });
  it.each(['', '01', '-1', '1.5', '1e3', ' 5', '5 ', '1'.repeat(19), ['5', '6']])(
    'rejects invalid or duplicate budget %j', (value) => {
      expect(parseBusinessBudget(value).invalid).toBe(true);
    },
  );
  it('provides a labelled search and does not confuse budget with available cash', () => {
    const page = readFileSync('src/app/businesses/page.tsx', 'utf8');
    expect(page).toContain('name="maxCost"');
    expect(page).toContain('readonly searchParams: Promise<');
    expect(page).toContain('role="search"');
    expect(page).toContain('인수 비용 상한');
    expect(page).toContain('예산은 검색 조건이며 보유 잔액이나 구매 가능 여부를 뜻하지 않습니다.');
    expect(page).toContain('maxCost=${budget.value}');
  });
});
