import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const { apiMock, guardMock } = vi.hoisted(() => ({ apiMock: vi.fn(), guardMock: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull: apiMock }));
vi.mock('@/lib/session', () => ({ requireAdminConsole: guardMock }));
import Page, { metadata } from './page';

beforeEach(() => { apiMock.mockReset(); guardMock.mockReset(); });

describe('admin Discord delivery page', () => {
  it('shows unavailable evidence rather than fabricated zero counts, with accessible retry', async () => {
    apiMock.mockResolvedValue(null);
    const html = renderToStaticMarkup(await Page());
    expect(guardMock).toHaveBeenCalledWith('/admin/logs/delivery');
    expect(html).toContain('조회 불가');
    expect(html).not.toContain('>0건<');
    expect(html).toContain('role="alert"');
    expect(html).toContain('다시 조회');
    expect(html).toContain('min-h-11');
  });
  it('shows zero only for verified empty rows and labels the 30-row scope', async () => {
    apiMock.mockResolvedValue({ events: [] });
    const html = renderToStaticMarkup(await Page());
    expect(html).toContain('0건');
    expect(html).toContain('최근 최대 30건');
    expect(html).not.toContain('조회 불가');
  });
  it('fails closed on a malformed successful HTTP payload', async () => {
    apiMock.mockResolvedValue({ events: [{ delivery_status: 'delivered' }] });
    const html = renderToStaticMarkup(await Page());
    expect(html).toContain('조회 불가');
    expect(html).not.toContain('1건');
  });
  it('separates suppressed/dead-letter outcomes from retryable deliveries', async () => {
    const base = {
      event_id: '8f3b33d2-f91c-4ed8-9e13-032884e9a922',
      event_type: 'wallet.deposit', created_at: '2026-10-27T12:00:00.000Z',
      delivered_at: null, delivery_attempts: 2, delivery_status: 'retry_pending',
    };
    apiMock.mockResolvedValue({ events: [
      base,
      { ...base, event_id: 'b6cfc890-930e-4a3c-9fd8-271f4e1c0a53', delivery_status: 'suppressed', delivery_attempts: 0 },
      { ...base, event_id: 'd8d02d98-6ad1-4c35-a16a-f9e05f7b1878', delivery_status: 'dead_letter' },
    ] });
    const html = renderToStaticMarkup(await Page());
    expect(html).toContain('전달 제외');
    expect(html).toContain('최종 실패');
    expect(html).toContain('보류·실패');
    expect(html).toContain('1건 · 2건');
    expect(html).not.toContain('3건 · 2건');
  });

  it('preserves admin noindex metadata', () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
