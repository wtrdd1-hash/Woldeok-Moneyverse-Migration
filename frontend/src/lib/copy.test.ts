import { describe, expect, it } from 'vitest';
import { copyProblems, pick } from './copy';

describe('page copy tables', () => {
  const ok = { title: { ko: '지갑', en: 'Wallet', ja: 'ウォレット', zh: '钱包', vi: 'Ví' } };
  it('picks the locale and falls back to English only when a value is empty', () => {
    expect(pick('vi', ok.title)).toBe('Ví');
    expect(pick('ja', { ...ok.title, ja: '' })).toBe('Wallet');
  });
  it('reports missing locales and Korean left in other locales', () => {
    expect(copyProblems(ok)).toEqual([]);
    expect(copyProblems({ t: { ko: '지갑', en: '지갑', ja: '', zh: '钱包', vi: 'Ví' } })).toEqual(['t.en contains Korean', 't.ja missing']);
  });
});
