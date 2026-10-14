import { describe, expect, it } from 'vitest';
import { parseNotificationFeed } from './notification-feed';
describe('notification feed validation', () => {
  it('rejects invalid payloads', () => {
    expect(() => parseNotificationFeed(null)).toThrow();
    expect(() => parseNotificationFeed({ notifications: null })).toThrow();
  });
  it('preserves an empty valid feed', () => {
    expect(parseNotificationFeed({ notifications: [] })).toEqual([]);
  });
});
