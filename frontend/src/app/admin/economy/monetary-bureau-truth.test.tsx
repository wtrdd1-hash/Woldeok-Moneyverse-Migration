import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MonetaryBureauCard, type MonetaryTelemetryData } from './monetary-bureau-card';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const verified: MonetaryTelemetryData = {
  m_total: '300', m_circulating: '200', m_treasury: '100',
  m_bank_liquidity: null, m_locked: null, is_issuance_frozen: false,
  active_policy_orders_count: 2, total_mint_certificates_count: 3,
  total_retirement_certificates_count: 4, verified_invariant: false,
  last_reconciled_at: null,
};

const props = { initialOrders: [], initialMints: [] };

describe('P1 monetary operator evidence integrity', () => {
  it('shows unavailable instead of fabricated WLD amounts or successful reconciliation', () => {
    const { container } = render(<MonetaryBureauCard {...props} initialTelemetry={null} />);
    expect(container.textContent).toContain('조회 불가');
    expect(container.textContent).not.toContain('59,928,020');
    expect(container.textContent).not.toContain('31,503');
    expect(container.textContent).not.toContain('59,896,517');
    expect(container.textContent).not.toContain('불변식 검증 일치');
    expect((screen.getByRole('button', { name: /긴급 발행 동결/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('shows measured WLD while clearly marking the invariant unverified', () => {
    const { container } = render(<MonetaryBureauCard {...props} initialTelemetry={verified} />);
    expect(container.textContent).toContain('300');
    expect(container.textContent).toContain('미검증');
    expect(container.textContent).not.toContain('불변식 검증 일치');
  });

  it('invalidates stale telemetry when refresh returns an HTTP error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    const { container } = render(<MonetaryBureauCard {...props} initialTelemetry={verified} />);
    fireEvent.click(screen.getByRole('button', { name: '새로고침' }));
    await waitFor(() => expect(container.textContent).toContain('조회 불가'));
    expect((screen.getByRole('button', { name: /긴급 발행 동결/ }) as HTMLButtonElement).disabled).toBe(true);
  });
});
