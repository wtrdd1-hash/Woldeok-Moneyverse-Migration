// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { viewerOrUnknown } from '@/lib/viewer';
import { apiOrNull } from '@/lib/api';
import { GET as getNotifications } from './route';
import { GET as getUnreadCount } from './unread-count/route';

vi.mock('@/lib/viewer', () => ({ viewerOrUnknown: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn() }));

const viewer = vi.mocked(viewerOrUnknown);
const upstream = vi.mocked(apiOrNull);

beforeEach(() => {
  viewer.mockReset();
  upstream.mockReset();
  viewer.mockResolvedValue({ signedIn: true } as Awaited<ReturnType<typeof viewerOrUnknown>>);
});

describe('authenticated notification upstream failures', () => {
  it('returns HTTP 503 rather than an empty notification list on upstream failure', async () => {
    upstream.mockResolvedValue(null);
    const response = await getNotifications(new Request('https://example.invalid/api/notifications'));
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(await response.json()).toEqual({ error: 'Notification service unavailable' });
  });

  it('returns HTTP 503 rather than a false zero unread count on upstream failure', async () => {
    upstream.mockResolvedValue(null);
    const response = await getUnreadCount();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'Notification service unavailable' });
  });

  it('rejects malformed unread counts rather than silently clearing the badge', async () => {
    upstream.mockResolvedValue({ unreadCount: -1 });
    expect((await getUnreadCount()).status).toBe(503);
  });

  it('preserves valid notification payloads and count responses', async () => {
    upstream.mockResolvedValueOnce([{ id: 'notice-1' }]).mockResolvedValueOnce({ unreadCount: 3 });
    const notifications = await getNotifications(new Request('https://example.invalid/api/notifications'));
    expect(notifications.status).toBe(200);
    expect(await notifications.json()).toEqual({ notifications: [{ id: 'notice-1' }] });
    const count = await getUnreadCount();
    expect(count.status).toBe(200);
    expect(await count.json()).toEqual({ unreadCount: 3 });
  });
});

it('notification center pauses hidden-tab polling, backs off failures and announces outages accessibly', () => {
  const source = readFileSync(join(process.cwd(), 'src/components/notification-center-modal.tsx'), 'utf8');
  expect(source).toContain('document.hidden');
  expect(source).toContain('visibilitychange');
  expect(source).toContain('MAX_POLL_INTERVAL_MS = 60000');
  expect(source).toContain('currentRequest?.abort()');
  expect(source).toContain('setCountUnavailable(true)');
  expect(source).toContain('role="alert"');
  expect(source).toContain('min-h-11 min-w-11');
  expect(source).not.toContain('setInterval(');
});
