import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import {
  SUPPORTED_LOCALES,
  normalizeLocale,
  detectBrowserLocale,
  resolvePreference,
  buildLanguageUrl,
  readCookie,
} from '../../main/resources/static/mv-spring/v39/locale-core.mjs';

test('exactly five existing site languages are retained', () => {
  assert.deepEqual(SUPPORTED_LOCALES, ['en','ko','ja','zh','vi']);
});

test('normalization recognizes native locale variants, not arbitrary input', () => {
  assert.equal(normalizeLocale('zh-CN'), 'zh');
  assert.equal(normalizeLocale('ja-JP'), 'ja');
  assert.equal(normalizeLocale('KO_kr'), 'ko');
  assert.equal(normalizeLocale('XX'), null);
  assert.equal(normalizeLocale('javascript:alert(1)'), null);
});

test('auto browser language detection falls back to English', () => {
  assert.equal(detectBrowserLocale(['fr-FR','ko-KR','en-US']), 'ko');
  assert.equal(detectBrowserLocale(['zh-TW','en-US']), 'zh');
  assert.equal(detectBrowserLocale(['es-ES','de-DE']), 'en');
  assert.equal(detectBrowserLocale([]), 'en');
});

test('manual choice wins over browser; explicit URL beats saved manual preference', () => {
  assert.deepEqual(resolvePreference({ savedLanguage:'vi', browserLanguages:['ko-KR'] }), { locale:'vi', mode:'manual' });
  assert.deepEqual(resolvePreference({ urlLanguage:'ja', savedLanguage:'vi', browserLanguages:['ko-KR'] }), { locale:'ja', mode:'manual' });
});

test('automatic mode ignores stale query, detects browser and allows resetting manual cookie', () => {
  assert.deepEqual(resolvePreference({ urlLanguage:'ko', isAutoUrl:true, savedLanguage:'vi', browserLanguages:['ja-JP'] }), { locale:'ja', mode:'auto' });
  assert.deepEqual(resolvePreference({ savedLanguage:'unsupported', browserLanguages:['it-IT'] }), { locale:'en', mode:'auto' });
});

test('selected language URL retains unrelated search params and fragment; no duplicate lang', () => {
  const x=buildLanguageUrl('https://example.com/admin/users?lang=ko&q=a%26b&limit=20#items','ja',false);
  assert.equal(x,'/admin/users?q=a%26b&limit=20&lang=ja#items');
  assert.equal(buildLanguageUrl('https://example.com/status?lang=ko&mv_auto=1','vi',true),
    '/status?lang=vi&mv_auto=1');
});

test('cookie parser handles encoded values without executing cookie contents', () => {
  assert.equal(readCookie('foo=bar; wdmv_locale=zh; other=x','wdmv_locale'), 'zh');
  assert.equal(readCookie('wdmv_locale=ja%2DJP','wdmv_locale'),'ja-JP');
  assert.equal(readCookie('foo=bar','wdmv_locale'), null);
});
