import { describe, expect, it } from 'vitest';
import {
  CATEGORY_NAV,
  HEADER_ADMIN,
  HEADER_MEMBER,
  HEADER_PUBLIC,
  isGroup,
  navLabel,
} from './navigation';

describe('navigation', () => {
  it('has unique group labels within HEADER_PUBLIC', () => {
    const labels = HEADER_PUBLIC.map((item) => item.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('has unique group labels within HEADER_MEMBER', () => {
    const labels = HEADER_MEMBER.map((item) => item.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('produces no duplicate labels when merged for signed-in members', () => {
    const publicItems = HEADER_PUBLIC.filter((item) => !isGroup(item) || item.label !== '경제');
    const merged = [...publicItems, ...HEADER_MEMBER, ...HEADER_ADMIN];
    const labels = merged.map((item) => item.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('ensures every category and header nav label translates cleanly across ko, en, ja, zh', () => {
    const allItems = [...HEADER_PUBLIC, ...HEADER_MEMBER, ...HEADER_ADMIN];
    for (const item of allItems) {
      expect(navLabel(item.label, 'en')).toBeTruthy();
      expect(navLabel(item.label, 'ja')).toBeTruthy();
      expect(navLabel(item.label, 'zh')).toBeTruthy();
      if (isGroup(item)) {
        for (const entry of item.entries) {
          expect(navLabel(entry.label, 'en')).toBeTruthy();
          expect(navLabel(entry.label, 'ja')).toBeTruthy();
          expect(navLabel(entry.label, 'zh')).toBeTruthy();
        }
      }
    }

    for (const cat of CATEGORY_NAV) {
      expect(navLabel(cat.label, 'en')).toBeTruthy();
      expect(navLabel(cat.label, 'ja')).toBeTruthy();
      expect(navLabel(cat.label, 'zh')).toBeTruthy();
      for (const entry of cat.entries) {
        expect(navLabel(entry.label, 'en')).toBeTruthy();
        expect(navLabel(entry.label, 'ja')).toBeTruthy();
        expect(navLabel(entry.label, 'zh')).toBeTruthy();
      }
    }
  });
});
