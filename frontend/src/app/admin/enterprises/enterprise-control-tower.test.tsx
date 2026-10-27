import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EnterpriseControlTower } from './enterprise-control-tower';
import { validOverview, validSoe } from './enterprise-evidence-fixtures';

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: mocks.refresh }) }));
vi.mock('sonner', () => ({
  toast: { success: mocks.success, error: mocks.error, info: mocks.info },
}));

describe('enterprise admin authoritative mutation readback', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });
  it('does not invent dividend audit rows after a harvest response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          total_dividends_collected: '9007199254740993',
          treasury_balance_after: '9007199254740995',
          enterprises_processed: 1,
        }),
      }),
    );
    render(
      <EnterpriseControlTower
        initialOverview={validOverview}
        initialSoes={[validSoe]}
        initialPrivate={[]}
        initialDividendLogs={[]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /공기업 배당 국고 즉시 수취/ }));
    await waitFor(() => expect(mocks.refresh).toHaveBeenCalledTimes(1));
    expect(screen.getByText('기록된 공기업 배당 이력이 없습니다.')).toBeTruthy();
    expect(mocks.success).not.toHaveBeenCalled();
  });
  it('does not optimistically change SOE status on a failed backend receipt', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: false, code: 'SOE_POWER', status: 'PAUSED' }),
      }),
    );
    render(
      <EnterpriseControlTower
        initialOverview={validOverview}
        initialSoes={[validSoe]}
        initialPrivate={[]}
        initialDividendLogs={[]}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '일시 정지' }));
    await waitFor(() => expect(mocks.error).toHaveBeenCalled());
    expect(screen.getByText('ACTIVE')).toBeTruthy();
    expect(mocks.refresh).not.toHaveBeenCalled();
  });
});
