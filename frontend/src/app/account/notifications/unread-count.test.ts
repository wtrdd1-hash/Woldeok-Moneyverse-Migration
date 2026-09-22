import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { GET } from '@/app/api/notifications/unread-count/route';

const notifButtonSource = readFileSync(
  join(process.cwd(), 'src/components/notification-header-button.tsx'),
  'utf8',
);
const chatButtonSource = readFileSync(
  join(process.cwd(), 'src/components/chat-header-button.tsx'),
  'utf8',
);

describe('Notification & Chat unread count polling safety', () => {
  it('BFF unread-count route returns status 200 with unreadCount: 0 and private no-store', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');

    const json = await response.json();
    expect(json).toEqual({ unreadCount: 0 });
  });

  it('NotificationHeaderButton incorporates visibilityState guard and exponential backoff', () => {
    expect(notifButtonSource).toContain('document.hidden');
    expect(notifButtonSource).toContain('visibilitychange');
    expect(notifButtonSource).toContain('BASE_POLL_INTERVAL_MS = 15000');
    expect(notifButtonSource).toContain('MAX_POLL_INTERVAL_MS = 60000');
    expect(notifButtonSource).toContain('Math.min(MAX_POLL_INTERVAL_MS, retryDelayRef.current * 2)');
  });

  it('ChatHeaderButton incorporates totalUnread parsing, visibilityState guard, and exponential backoff', () => {
    expect(chatButtonSource).toContain('data.totalUnread ?? data.unreadCount');
    expect(chatButtonSource).toContain('document.hidden');
    expect(chatButtonSource).toContain('visibilitychange');
    expect(chatButtonSource).toContain('BASE_POLL_INTERVAL_MS = 15000');
    expect(chatButtonSource).toContain('MAX_POLL_INTERVAL_MS = 60000');
    expect(chatButtonSource).toContain('Math.min(MAX_POLL_INTERVAL_MS, retryDelayRef.current * 2)');
  });
});
