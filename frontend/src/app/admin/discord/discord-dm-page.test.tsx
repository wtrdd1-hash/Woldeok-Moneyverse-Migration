import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { read, gate } = vi.hoisted(() => ({ read: vi.fn(), gate: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull: read }));
vi.mock('@/lib/session', () => ({ requireAdminConsole: gate }));
vi.mock('./admin-discord-dm-test-button', () => ({ AdminDiscordDmTestButton: () => <div data-testid="dm-test" /> }));
vi.mock('./admin-discord-broadcast-test-button', () => ({ AdminDiscordBroadcastTestButton: () => null }));
import Page from './page';

const outbox = {
  stuck_count: '0', pending_count: '0', retry_pending_count: '0', delivering_count: '0',
  delivered_24h_count: '0', dead_letter_count: '0', suppressed_count: '0', unrouted_type_count: '0',
  oldest_undelivered_at: null, last_delivered_at: null, last_failure_at: null,
};

beforeEach(() => vi.clearAllMocks());

describe('Discord administrator console readiness evidence', () => {
  it('does not show a recipient or DM test when readiness is missing', async () => {
    read.mockResolvedValue({ outbox, routes: [] });
    const html = renderToStaticMarkup(await Page());
    expect(gate).toHaveBeenCalledWith('/admin/discord');
    expect(html).toContain('발송 설정 확인 필요');
    expect(html).toContain('role="status"');
    expect(html).toContain('미확인');
    expect(html).not.toContain('data-testid="dm-test"');
  });

  it('shows the DM test only when the backend confirms explicit configuration', async () => {
    read.mockResolvedValue({ outbox, routes: [], adminAlertInfo: { configured: true, adminUserId: '123456789012345678' } });
    const html = renderToStaticMarkup(await Page());
    expect(html).toContain('data-testid="dm-test"');
    expect(html).toContain('전달 미검증');
    expect(html).not.toContain('봇 연동 활성 (ACTIVE)');
  });
});
