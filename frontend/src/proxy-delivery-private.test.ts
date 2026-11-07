import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from './proxy';

describe('admin Discord delivery edge privacy', () => {
  it.each(['/admin/logs/delivery', '/en/admin/logs/delivery', '/ko/admin/logs/delivery'])('protects the actual HTTP response for %s', (path) => {
    const response = proxy(new NextRequest('https://easy-scraping.com' + path + '?status=outstanding&event=wallet.deposit'));
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  });
  it('does not mark unrelated public pages private', () => {
    const response = proxy(new NextRequest('https://easy-scraping.com/'));
    expect(response.headers.get('cache-control')).not.toBe('private, no-store');
  });
});
