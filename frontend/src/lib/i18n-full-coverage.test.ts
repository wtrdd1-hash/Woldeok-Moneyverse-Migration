import { describe, it, expect } from 'vitest';
import {
  detectLocale,
  parseAcceptLanguage,
  localeLabel,
  SUPPORTED_LOCALES,
  type Locale,
} from './locale';
import {
  I18N_DICTIONARY,
  STOCK_NAMES_BY_LOCALE,
  getStockName,
  t,
} from './i18n-dictionary';

describe('i18n Comprehensive Translation & Automatic Locale Detection Guardrails', () => {
  describe('1. Automatic Locale Detection (GeoIP & Accept-Language)', () => {
    it('accurately resolves Asian primary countries including Vietnam (VN)', () => {
      expect(detectLocale('KR', null)).toBe('ko');
      expect(detectLocale('KP', null)).toBe('ko');
      expect(detectLocale('JP', null)).toBe('ja');
      expect(detectLocale('CN', null)).toBe('zh');
      expect(detectLocale('TW', null)).toBe('zh');
      expect(detectLocale('HK', null)).toBe('zh');
      expect(detectLocale('SG', null)).toBe('zh');
      expect(detectLocale('VN', null)).toBe('vi');
    });

    it('defaults global Western and international countries to English', () => {
      const globalCountries = ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'TH', 'IN', 'BR'];
      for (const country of globalCountries) {
        expect(detectLocale(country, null)).toBe('en');
        expect(detectLocale(country, 'en-US,en;q=0.9')).toBe('en');
      }
    });

    it('respects explicit Asian/Vietnamese language header even from international IP', () => {
      expect(detectLocale('US', 'ja-JP,ja;q=0.9,en;q=0.8')).toBe('ja');
      expect(detectLocale('GB', 'zh-CN,zh;q=0.9,en;q=0.8')).toBe('zh');
      expect(detectLocale('DE', 'ko-KR,ko;q=0.9,en;q=0.8')).toBe('ko');
      expect(detectLocale('US', 'vi-VN,vi;q=0.9,en;q=0.8')).toBe('vi');
    });

    it('parses q-factor weighted Accept-Language correctly including Vietnamese', () => {
      expect(parseAcceptLanguage('en-US;q=0.5,ja;q=0.9')).toBe('ja');
      expect(parseAcceptLanguage('fr-FR;q=0.8,zh-CN;q=0.9')).toBe('zh');
      expect(parseAcceptLanguage('es,de;q=0.8,ko;q=0.7')).toBe('ko');
      expect(parseAcceptLanguage('en;q=0.6,vi-VN;q=0.9')).toBe('vi');
      expect(parseAcceptLanguage(null)).toBeNull();
      expect(parseAcceptLanguage('')).toBeNull();
    });
  });

  describe('2. 18 Canonical Virtual Stock Names across 5 Locales (KO/EN/JA/ZH/VI)', () => {
    const symbols = [
      'WDG', 'CHIMU314', 'WDM', 'WDB', 'WDT', 'MYUY',
      'CHIPS', 'DUCK', 'WFIN', 'SPACE',
      'WDX-TEC', 'WDX-FIN', 'WDX-RET', 'WDX-LOG', 'WDX-BIO',
      'WDX-ENT', 'WDX-ENG', 'WDX-DEF',
    ];

    it('defines translations for all 18 symbols in ko, en, ja, zh, vi without empty values', () => {
      for (const symbol of symbols) {
        const item = STOCK_NAMES_BY_LOCALE[symbol];
        expect(item, `Symbol ${symbol} should exist in STOCK_NAMES_BY_LOCALE`).toBeDefined();
        if (item) {
          for (const loc of SUPPORTED_LOCALES) {
            expect(item[loc], `Symbol ${symbol} must have translation for ${loc}`).toBeTruthy();
            expect(getStockName(symbol, loc)).toBe(item[loc]);
          }
        }
      }
    });

    it('falls back gracefully to symbol when unknown', () => {
      expect(getStockName('UNKNOWN_CORP', 'en')).toBe('UNKNOWN_CORP');
      expect(getStockName('UNKNOWN_CORP', 'ja', 'Fallback Corp')).toBe('Fallback Corp');
      expect(getStockName('UNKNOWN_CORP', 'vi', 'Fallback Corp')).toBe('Fallback Corp');
    });
  });

  describe('3. Core FinTech & P2P Dictionary Tokens Coverage', () => {
    const requiredTokens = [
      'home.ledger_running',
      'home.total_virtual_assets',
      'home.stock_trading',
      'stocks.filter_all',
      'stocks.safe_notice_title',
      'skip.content',
      'p2p.modal_title',
      'guest.modal_title',
      'tools.compound_title',
      'admin.dashboard_title',
    ];

    it('contains all required tokens with non-empty translations for all 5 locales', () => {
      for (const token of requiredTokens) {
        const entry = I18N_DICTIONARY[token];
        expect(entry, `Token ${token} should exist in I18N_DICTIONARY`).toBeDefined();
        if (entry) {
          for (const loc of SUPPORTED_LOCALES) {
            expect(entry[loc], `Token ${token} should have translation for ${loc}`).toBeTruthy();
            expect(t(token, loc)).toBe(entry[loc]);
          }
        }
      }
    });
  });

  describe('4. localeLabel Helper Function Verification (5 Locales)', () => {
    it('returns exact localized string according to active locale', () => {
      const koText = '테스트 한글';
      const enText = 'Test English';
      const jaText = 'テスト日本語';
      const zhText = '测试中文';
      const viText = 'Thử nghiệm Tiếng Việt';

      expect(localeLabel('ko', koText, enText, jaText, zhText, viText)).toBe(koText);
      expect(localeLabel('en', koText, enText, jaText, zhText, viText)).toBe(enText);
      expect(localeLabel('ja', koText, enText, jaText, zhText, viText)).toBe(jaText);
      expect(localeLabel('zh', koText, enText, jaText, zhText, viText)).toBe(zhText);
      expect(localeLabel('vi', koText, enText, jaText, zhText, viText)).toBe(viText);
    });

    it('falls back to english if vietnamese is missing', () => {
      expect(localeLabel('vi', '한글', 'English')).toBe('English');
    });
  });
});
