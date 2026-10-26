import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const apiMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/api', () => ({
  api: apiMock,
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number) {
      super('API failure');
      this.status = status;
    }
  },
}));
vi.mock('@/lib/session', () => ({ requireAdminConsole: vi.fn().mockResolvedValue(undefined) }));

import Page from './page';

const verifiedProjection = {
  baseline_m2_amount: '1000000',
  baseline_issued_24h: '1000',
  baseline_burned_24h: '500',
  days: 30,
  issuance_change_bps: 0,
  sink_change_bps: 0,
  projected_issued_per_day: '1000',
  projected_burned_per_day: '500',
  projected_net_per_day: '500',
  projected_m2_amount: '1015000',
  projected_m2_delta_amount: '15000',
  projected_m2_change_bps: '150',
  supply_floor_reached: false,
  advisory: ['Deterministic read-only projection'],
};

async function renderPage() {
  return renderToStaticMarkup(await Page({ searchParams: Promise.resolve({}) }));
}

describe('economy scenario lab SSR evidence', () => {
  beforeEach(() => apiMock.mockReset());

  it('renders authenticated server projection with rule-only review, not fictional AI votes', async () => {
    apiMock.mockResolvedValue(verifiedProjection);
    const html = await renderPage();
    expect(html).toContain('data-evidence-source="DETERMINISTIC_RULES"');
    expect(html).toContain('수동 검토 필요');
    expect(html).toContain('AI 모델을 호출하거나 실제 위원회 투표');
    expect(html).not.toMatch(/Llama 3\.2|Gemma 3|만장일치 승인/);
  });

  it('withholds financial metrics when API payload is malformed', async () => {
    apiMock.mockResolvedValue({ ...verifiedProjection, projected_m2_amount: 'NaN' });
    const html = await renderPage();
    expect(html).toContain('role="alert"');
    expect(html).toContain('검증 가능한 시나리오 결과');
    expect(html).not.toContain('data-evidence-source=');
  });

  it('does not render a synthetic baseline when the API returns no result', async () => {
    apiMock.mockResolvedValue(undefined);
    const html = await renderPage();
    expect(html).toContain('검증 가능한 시나리오 결과');
    expect(html).not.toContain('data-evidence-source=');
    expect(html).not.toContain('만장일치');
  });
});
