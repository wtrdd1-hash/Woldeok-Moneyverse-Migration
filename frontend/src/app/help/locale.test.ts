import { describe, expect, it } from 'vitest';
import { helpArticleHref, normalizeHelpLocale, helpReviewDeadline } from './locale';

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

describe('public verified-source freshness label', () => {
  it('renders a deterministic UTC deadline in Korean and English', () => {
    const deadline = '2030-01-02T03:04:00.000Z';
    const now = Date.parse('2029-12-01T00:00:00Z');
    const english = helpReviewDeadline(deadline, 'en', now);
    const korean = helpReviewDeadline(deadline, 'ko', now);
    expect(english?.dateTime).toBe(deadline);
    expect(english?.label).toContain('2030');
    expect(korean?.label).toContain('2030');
    expect(english?.label).not.toBe(korean?.label);
  });
  it('never displays an invalid or expired deadline as verified', () => {
    expect(helpReviewDeadline('invalid', 'en')).toBeNull();
    expect(helpReviewDeadline('2020-01-01T00:00:00Z', 'ko', Date.parse('2020-01-01T00:00:00Z'))).toBeNull();
    expect(helpReviewDeadline('', 'ko')).toBeNull();
  });
});
