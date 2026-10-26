import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BondControlTower } from './bond-control-tower';
import { validTelemetry } from './bond-telemetry.fixture';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe('admin bond operator safety', () => {
  it('does not invent rates, AAA guarantees, or payout permission when telemetry is unavailable', () => {
    render(<BondControlTower initialTelemetry={null} />);
    expect(screen.getByRole('alert').textContent).toMatch(/조회.*실패|확인할 수 없/);
    expect(
      screen.getByRole('button', { name: /쿠폰 이자 즉시 일괄 지급/ }).hasAttribute('disabled'),
    ).toBe(true);
    expect(screen.queryByText(/AAA RATED/)).toBeNull();
    expect(screen.queryByText(/4\.50%/)).toBeNull();
    expect(screen.queryByText(/ACTIVE PIPELINE/)).toBeNull();
  });
  it('renders verified empty records without a fabricated 3 active offerings', () => {
    render(
      <BondControlTower
        initialTelemetry={{
          ...validTelemetry,
          overview: { ...validTelemetry.overview, totalBondsActive: 0 },
          bonds: [],
          couponLogs: [],
        }}
      />,
    );
    expect(screen.getByText('0 ACTIVE OFFERINGS')).toBeDefined();
    expect(screen.queryByText('3 ACTIVE OFFERINGS')).toBeNull();
    expect(
      screen.getByRole('button', { name: /쿠폰 이자 즉시 일괄 지급/ }).hasAttribute('disabled'),
    ).toBe(false);
  });
  it('fails closed and clears stale data on malformed refresh response', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue({
          ok: true,
          json: async () => ({ overview: { totalBondsActive: 3 }, bonds: [], couponLogs: [] }),
        }),
    );
    render(<BondControlTower initialTelemetry={validTelemetry} />);
    fireEvent.click(screen.getByRole('button', { name: /새로고침/ }));
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /쿠폰 이자 즉시 일괄 지급/ }).hasAttribute('disabled'),
      ).toBe(true),
    );
    expect(screen.getByRole('alert')).toBeDefined();
    vi.unstubAllGlobals();
  });
});
