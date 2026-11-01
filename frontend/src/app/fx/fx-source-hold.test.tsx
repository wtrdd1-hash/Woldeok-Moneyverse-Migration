// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import SeoulFxPortalPage from './page';
import { metadata } from './layout';

describe('FX source truth and settlement hold', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()));
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

  it('never renders a synthetic quote or transaction controls while source is loading', () => {
    vi.mocked(fetch).mockImplementation(() => new Promise(() => {}));
    render(<SeoulFxPortalPage />);
    expect(screen.getByRole('status').textContent).toContain('확인 중');
    expect(screen.queryByText('1352.50')).toBeNull();
    expect(screen.queryByText(/즉시 환전/)).toBeNull();
    expect(screen.queryByText(/환전 완료/)).toBeNull();
  });

  it('shows an accessible retry instead of synthetic FX rates or settlement on HTTP 503', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 503, json: async () => ({ message: 'fx_source_unverified' }) } as Response);
    render(<SeoulFxPortalPage />);
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('검증되지 않아');
    expect(screen.getByRole('button', { name: '다시 확인' })).toBeTruthy();
    expect(document.body.textContent).not.toContain('1352.50');
    expect(screen.queryByRole('button', { name: /환전하기|계약 체결/ })).toBeNull();
    expect(fetch).toHaveBeenCalledWith('/api/v1/fx/portal', expect.objectContaining({ cache: 'no-store' }));
    expect(fetch).toHaveBeenCalledTimes(1); // No private wallet/contract reads while the public source is unverified.
  });

  it('rejects success-shaped quotes without independent source evidence', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ success: true, data: { reserves: { currentRate: 1352.5 } } }) } as Response);
    render(<SeoulFxPortalPage />);
    expect((await screen.findByRole('alert')).textContent).toContain('검증되지 않아');
    expect(document.body.textContent).not.toContain('1352.50');
  });

  it('retries source read without silently accepting unavailable state as an empty market', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 503 } as Response);
    render(<SeoulFxPortalPage />);
    fireEvent.click(await screen.findByRole('button', { name: '다시 확인' }));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect((await screen.findByRole('alert')).textContent).toContain('검증되지 않아');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
