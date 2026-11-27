import { describe, expect, it } from 'vitest';
import {
  D180_ADMIN_NAV, D180_MEMBER_NAV, V10_ACCOUNT_ITEM, V10_MOBILE_DOCK, V10_PRIMARY_NAV, V10_TOOLS_ITEM,
  SHELL_KEYS, navLabel, v10PageTitle,
} from './v10-nav';
import { TRANSLATIONS } from '@/lib/translations';
import { LANGUAGE_OPTIONS } from './language-switcher';

const LOCALES = ['en', 'ko', 'ja', 'zh', 'vi'] as const;

// NAV-01 / I18N-01 / I18N-02 (mobile navigation audit 2026-11-26): every navigation and shell
// string is a catalog key with all five languages; Korean keeps the existing product copy.
describe('navigation localisation', () => {
  it('every navigation item and shell string has all five languages', () => {
    const keys = [
      ...[...V10_PRIMARY_NAV, V10_TOOLS_ITEM, V10_ACCOUNT_ITEM, ...V10_MOBILE_DOCK, ...D180_MEMBER_NAV].map((i) => i.key),
      ...D180_ADMIN_NAV.map((i) => i.key), ...SHELL_KEYS,
    ];
    for (const key of keys) {
      const entry = TRANSLATIONS[key];
      expect(entry, key).toBeDefined();
      for (const l of LOCALES) expect(entry?.[l]?.trim(), `${key}.${l}`).toBeTruthy();
    }
  });

  it('every home, title, shell and navigation catalog key has all five languages', () => {
    const keys = Object.keys(TRANSLATIONS).filter((k) => /^(home|title|shell|nav\.v10|nav\.admin)\./.test(k));
    expect(keys.length).toBeGreaterThan(80);
    for (const key of keys) for (const l of LOCALES) expect(TRANSLATIONS[key]?.[l]?.trim(), `${key}.${l}`).toBeTruthy();
  });

  it('the mobile dock reads in the selected language and Korean is unchanged', () => {
    expect(V10_MOBILE_DOCK.map((i) => navLabel(i, 'en'))).toEqual(['Home', 'Quests', 'Exchange', 'Wallet', 'Account']);
    expect(V10_MOBILE_DOCK.map((i) => navLabel(i, 'ko'))).toEqual(['홈', '퀘스트', '거래소', '지갑', '계정']);
    for (const l of ['ja', 'zh', 'vi'] as const) {
      for (const item of V10_MOBILE_DOCK) expect(navLabel(item, l)).not.toMatch(/[가-힣]/);
    }
  });

  it('page titles follow the selected language', () => {
    expect(v10PageTitle('/', 'en')).toBe('Guild Hall');
    expect(v10PageTitle('/', 'ko')).toBe('길드 홀');
    expect(v10PageTitle('/bonds', 'ja')).toBe('債券');
    expect(v10PageTitle('/en/blog', 'en')).toBe('Blog');
    expect(v10PageTitle('/shop', 'vi')).toBe('Cửa hàng');
  });

  it('the language switcher lists English first and Korean second', () => {
    expect(LANGUAGE_OPTIONS.map((o) => o.value)).toEqual(['en', 'ko', 'ja', 'zh', 'vi']);
  });
});
