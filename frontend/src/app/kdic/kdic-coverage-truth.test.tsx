// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import KdicPortalPage from './page';
import { metadata } from './layout';

describe('KDIC public coverage source truth', () => {
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it('shows a clear unavailable state, not fictitious insurance guarantees or reserve amounts', () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    render(<KdicPortalPage />);
    expect(screen.getByRole('status').textContent).toMatch(/검증되지 않아|제공하지 않습니다/);
    expect(screen.getByRole('link', { name: /은행/ })).toBeTruthy();
    expect(screen.queryByText(/대한민국 예금자보호법 제31조 공식 적용/)).toBeNull();
    expect(screen.queryByText(/10,000,000 WLD/)).toBeNull();
    expect(screen.queryByText(/법적 보호 금액/)).toBeNull();
  });

  it('does not advertise legal depositor protection or official government affiliation in SEO', () => {
    expect(metadata.title).not.toMatch(/예금보험공사\(KDIC\).*5천만원/);
    expect(metadata.description).not.toMatch(/법적|전액 보장|공식 적용|실시간 공시/);
  });
});
