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
  it('preserves admin noindex metadata', () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
