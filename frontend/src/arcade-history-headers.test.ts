import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import config from '../next.config';

describe('private casino settlement history and accessible recovery', () => {
  it('overrides global public SEO headers for arcade and all localized routes', async () => {
    const groups = await config.headers!();
    for (const route of ['/arcade', '/:locale(ko|en|ja|zh|vi)/arcade']) {
      const group = groups.find((item) => item.source === route);
      expect(group).toBeDefined();
      const headers = new Map(group!.headers.map((item) => [item.key, item.value]));
      expect(headers.get('x-robots-tag')).toBe('noindex, nofollow');
      expect(headers.get('cache-control')).toBe('private, no-store');
      expect(headers.get('referrer-policy')).toBe('no-referrer');
    }
  });
  it('renders only parsed history and gives an accessible retry on source failure', () => {
    const page = readFileSync(join(__dirname, 'app/arcade/page.tsx'), 'utf8');
    expect(page).toContain('parseCasinoHistory(historyRaw)');
    expect(page).toContain('history === null');
    expect(page).toContain('role="alert"');
    expect(page).toContain('기록 다시 조회');
    expect(page).toContain('min-h-11');
  });
});
