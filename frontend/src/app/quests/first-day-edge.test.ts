import { describe, expect, it } from 'vitest';
import config from '../../../next.config';

describe('first-day onboarding SEO and privacy at Next edge', () => {
  it('keeps base and localized member quest pages private', async () => {
    const rules = await config.headers?.();
    for (const source of ['/quests', '/:locale(en|ko|ja|zh|vi)/quests']) {
      const rule = rules?.find((entry) => entry.source === source);
      expect(rule).toBeDefined();
      expect(rule?.headers).toEqual(expect.arrayContaining([
        { key: 'x-robots-tag', value: 'noindex, nofollow' },
        { key: 'cache-control', value: 'private, no-store' },
        { key: 'referrer-policy', value: 'no-referrer' },
      ]));
    }
  });
});
