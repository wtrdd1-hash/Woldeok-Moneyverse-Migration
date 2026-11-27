import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }));
vi.mock('sonner', () => ({ toast }));
import { SwfControlPanel } from './swf-control-panel';

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

// Codex review of the integration candidate: the API now refuses the SWF rebalance (503) until an
// investment is a journaled transaction. The panel turned any non-OK answer into an info toast
// saying the rebalance status was verified normally. A refusal is an error.
describe('SWF rebalance refusal', () => {
  it('reports a refused rebalance as a failure, never as verified', async () => {
    vi.stubEnv('NEXT_PUBLIC_MONEYVERSE_SWF_OPERATIONAL', 'true');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ message: 'SWF rebalance requires a ledger-posted investment receipt' }), { status: 503 })));
    render(<SwfControlPanel initialConfig={{ is_enabled: true, safe_reserve_wld: '10000000', max_single_investment_wld: '10000000', equity_ratio_pct: 50, bond_ratio_pct: 30, dividend_ratio_pct: 20 }} />);
    const buttons = screen.getAllByRole('button').filter((b) => /리밸런싱/.test(b.textContent ?? '') && !(b as HTMLButtonElement).disabled);
    expect(buttons.length).toBeGreaterThan(0);
    fireEvent.click(buttons[0]!);
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(toast.info).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });
});
