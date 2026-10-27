import { describe, expect, it } from 'vitest';
import { helpArticleHref, normalizeHelpLocale } from './locale';

describe('verified help locale and safe article links', () => {
  it('allows English and Korean while failing closed to Korean for malformed locale', () => {
    expect(normalizeHelpLocale('en')).toBe('en');
    expect(normalizeHelpLocale('ko')).toBe('ko');
    expect(normalizeHelpLocale('en-US')).toBe('ko');
    expect(normalizeHelpLocale(undefined)).toBe('ko');
  });
  it('links to the selected locale without embedding search text in the URL', () => {
    expect(helpArticleHref('account-login', 'en')).toBe('/help/account-login?locale=en');
    expect(helpArticleHref('account-login', 'ko')).toBe('/help/account-login');
    expect(helpArticleHref('account-login', 'en')).not.toContain('secret');
  });
});
