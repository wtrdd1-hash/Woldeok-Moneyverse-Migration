import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => vi.fn());
const mutate = vi.hoisted(() => vi.fn());
vi.mock('@/lib/api', () => ({ api }));
vi.mock('@/lib/mutate', () => ({ mutate }));

import { getFxStatus, interveneFx, drawdownFxSwap, settleFxForward, toggleFxHalt } from './actions';

beforeEach(() => {
  api.mockReset();
  mutate.mockReset();
});

describe('FX admin server actions', () => {
  it('retrieves elevated status through the server API and unwraps the actual response', async () => {
    const data = { reserves: { isHalted: false } };
    api.mockResolvedValue({ success: true, data });
    await expect(getFxStatus()).resolves.toEqual(data);
    expect(api).toHaveBeenCalledWith('/api/v1/admin/fx/status');
  });

  it.each([
    ['intervene', () => interveneFx('SELL_USD', 50000), '/api/v1/admin/fx/intervene', { type: 'SELL_USD', amountUsd: 50000 }],
    ['drawdown', () => drawdownFxSwap('agreement-1', 150), '/api/v1/admin/fx/swaps/drawdown', { agreementId: 'agreement-1', amountUsd: 150, purpose: '외환위기 대응 긴급 유동성 수혈 및 시장 안정화' }],
    ['settle', () => settleFxForward('contract-1'), '/api/v1/admin/fx/forward/settle', { contractId: 'contract-1' }],
    ['halt', () => toggleFxHalt(true), '/api/v1/admin/fx/halt', { isHalted: true }],
  ] as const)('uses server-only CSRF mutation for %s', async (_label, call, path, body) => {
    mutate.mockResolvedValue({ success: true, data: {} });
    await call();
    expect(mutate).toHaveBeenCalledWith(path, { method: 'POST', body });
  });

  it('fails closed and returns an actionable error on authorization refusal', async () => {
    mutate.mockRejectedValue(new Error('forbidden'));
    await expect(toggleFxHalt(false)).resolves.toEqual({ success: false, error: '관리자 세션 또는 요청 권한을 확인해 주세요.' });
  });
});
