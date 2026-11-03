// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { GET } from '@/app/api/notifications/unread-count/route';
import { POST } from '@/app/api/notifications/claim-all/route';

describe('owner notification HTTP privacy', () => {
  it.each([['unread-count', GET], ['claim-all', POST]] as const)(
    '%s does not expose authentication failures to indexing or referrer forwarding', async (_name, handler) => {
      const response = await handler();
      expect(response.status).toBe(503);
      expect(response.headers.get('cache-control')).toBe('private, no-store');
      expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
      expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    },
  );
});
