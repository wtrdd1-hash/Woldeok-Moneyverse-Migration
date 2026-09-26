import { describe, expect, it } from 'vitest';
import { detectLocale, isLocale, parseAcceptLanguage } from './locale';

describe('locale detection', () => {
  it('enforces Korean as primary default and detects Korean for Korean traffic', () => {
    expect(detectLocale('KR', 'en-US,en;q=0.9')).toBe('ko');
    expect(detectLocale(null, null)).toBe('ko');
  });

  it('uses English for visitors outside Korea by default', () => {
    expect(detectLocale('US', 'en-US,en;q=0.9')).toBe('en');
    expect(detectLocale('GB', null)).toBe('en');
    expect(detectLocale('DE', null)).toBe('en');
    expect(detectLocale('FR', null)).toBe('en');
    expect(detectLocale('AU', null)).toBe('en');
  });

  it('supports Japanese and Chinese locales accurately from country codes', () => {
    expect(detectLocale('JP', 'en-US,en;q=0.9')).toBe('ja');
    expect(detectLocale('CN', 'en-US,en;q=0.9')).toBe('zh');
    expect(detectLocale('TW', 'en-US,en;q=0.9')).toBe('zh');
    expect(detectLocale('HK', 'en-US,en;q=0.9')).toBe('zh');
    expect(detectLocale('MO', 'en-US,en;q=0.9')).toBe('zh');
    expect(detectLocale('SG', 'en-US,en;q=0.9')).toBe('zh');
  });

  it('parses complex Accept-Language headers with q-factors correctly', () => {
    expect(parseAcceptLanguage('en-US,en;q=0.9,ko-KR;q=0.8')).toBe('en');
    expect(parseAcceptLanguage('ja-JP,ja;q=0.9,en-US;q=0.8')).toBe('ja');
    expect(parseAcceptLanguage('zh-CN,zh;q=0.9,en;q=0.8')).toBe('zh');
    expect(parseAcceptLanguage('fr-FR,fr;q=0.9,ko-KR;q=0.8')).toBe('ko');
  });

  it('uses browser language when country data is unavailable or anonymized', () => {
    expect(detectLocale('XX', 'en-GB,en;q=0.8')).toBe('en');
    expect(detectLocale('T1', 'ja-JP,ja;q=0.9')).toBe('ja');
    expect(detectLocale(null, 'ko-KR,ko;q=0.8')).toBe('ko');
    expect(detectLocale(null, 'zh-CN,zh;q=0.9')).toBe('zh');
  });

  it('only accepts supported explicit choices', () => {
    expect(isLocale('ko')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('ja')).toBe(true);
    expect(isLocale('zh')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale('de')).toBe(false);
  });
});
