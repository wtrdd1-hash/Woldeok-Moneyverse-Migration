import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { api } from '@/lib/api';
import AdminFxPage from './page';

vi.mock('@/lib/api', () => ({ api: vi.fn() }));
vi.mock('@/lib/session', () => ({ requireAdminConsole: vi.fn().mockResolvedValue({ roles: ['operator'] }) }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const ID = '11111111-1111-4111-8111-111111111111';
const TS = new Date().toISOString();
const status = {
  reserves: { id: ID, reserveName: 'Virtual FX', currency: 'USD', totalReservesUsd: 1234,
    targetAnchorRate: 1350, currentRate: 1352.5, isHalted: false,
    totalInterventionsCount: 0, totalIntervenedUsd: 0, updatedAt: TS },
  history: [], txs: [], sdrAllocations: [], swapAgreements: [], forwardContracts: [],
  ews: { fsiScore: 12, stage: 'NORMAL', triggerReason: 'Virtual model', currentSpotRate: 1352.5 },
};

describe('FX administrator server-rendered integration', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fails closed on backend errors without invented healthy market values', async () => {
    vi.mocked(api).mockRejectedValueOnce(new Error('42501 permission denied'));
    const html = renderToStaticMarkup(await AdminFxPage());
    expect(html).toContain('role="alert"');
    expect(html).toContain('다시 조회');
    expect(html).toContain('FX 환전·선물환 계약·정산');
    expect(html).not.toContain('1,000,000.00');
    expect(html).not.toContain('99.99%');
    expect(html).not.toContain('정상 개장');
  });

  it('renders only server-verified balances and keeps unsafe write controls disabled', async () => {
    vi.mocked(api).mockResolvedValueOnce({ success: true, data: status });
    const html = renderToStaticMarkup(await AdminFxPage());
    expect(html).toContain('1,234.00');
    expect(html).toContain('FX 조회 전용입니다.');
    expect(html).toContain('role="status"');
    expect(html).toContain('1352.50');
    expect(html).toContain('금융 집행은 검증 전까지 비활성화됩니다');
    expect(html).toContain('disabled=""');
    expect(html).not.toContain('1,000,000.00');
  });
});
