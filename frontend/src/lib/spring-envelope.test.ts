import { describe, expect, it } from 'vitest';
import { springData } from './spring-envelope';

describe('springData', () => {
  it('unwraps a success envelope', () => {
    expect(springData<{ a: number }>({ success: true, ok: true, data: { a: 1 } })).toEqual({ a: 1 });
  });
  it('returns null for a failure envelope or nothing', () => {
    expect(springData({ success: false, data: null })).toBeNull();
    expect(springData(null)).toBeNull();
  });
  it('passes a bare payload through', () => {
    expect(springData<{ a: number }>({ a: 2 })).toEqual({ a: 2 });
  });
});
