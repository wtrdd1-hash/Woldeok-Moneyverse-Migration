import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const { adminGate, apiMock } = vi.hoisted(() => ({
  adminGate: vi.fn(),
  apiMock: vi.fn(),
}));

vi.mock('next/link', () => ({ default: ({ children }: { children: React.ReactNode }) => <a href='/admin/economy'>{children}</a> }));
vi.mock('@/lib/session', () => ({ requireAdminConsole: adminGate }));
vi.mock('@/lib/api', () => ({
  api: apiMock,
  ApiError: class ApiError extends Error { status = 503; },
}));
vi.mock('@/components/page-header', () => ({
  PageHeader: ({ children, title }: { children: React.ReactNode; title: string }) => <header><h1>{title}</h1>{children}</header>,
  SectionHeader: ({ title }: { title: string }) => <h2>{title}</h2>,
}));
vi.mock('../../admin-back', () => ({ AdminBack: () => <span>Back</span> }));

import Page, { metadata } from './page';

const projection = {
  baseline_m2_amount: '1000000',
  baseline_issued_24h: '100',
  baseline_burned_24h: '50',
  days: 30,
  issuance_change_bps: 0,
  sink_change_bps: 0,
  projected_issued_per_day: '100',
  projected_burned_per_day: '50',
  projected_net_per_day: '50',
  projected_m2_amount: '1001500',
  projected_m2_delta_amount: '1500',
  projected_m2_change_bps: '15',
  supply_floor_reached: false,
  advisory: ['This is a deterministic projection, not a decision.'],
};

const renderPage = async () => renderToStaticMarkup(await Page({ searchParams: Promise.resolve({}) }));

describe('admin economy scenario lab evidence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminGate.mockResolvedValue(undefined);
  });

  it('keeps the authenticated real read-only projection but never invents AI model votes', async () => {
    apiMock.mockResolvedValue(projection);
    const html = await renderPage();
    expect(adminGate).toHaveBeenCalledWith('/admin/economy/scenario-lab');
    expect(apiMock).toHaveBeenCalledWith('/api/v1/admin/economy/scenario-lab/preview?days=30&issuanceChangeBps=0&sinkChangeBps=0');
    expect(html).toContain('시나리오 결과');
    expect(html).toContain('AI 심의 미실행');
    expect(html).toContain('수학적 가정');
    expect(html).not.toMatch(/만장일치 승인 권고|\[Llama 3\.2\]|\[Gemma 3\]|의결 로그 페이로드|실시간 시뮬레이션/);
  });

  it('never shows a synthetic council decision if the backend read fails', async () => {
    apiMock.mockRejectedValue(new Error('unavailable'));
    const html = await renderPage();
    expect(html).toContain('시나리오 기준 데이터를 불러오지 못했습니다.');
    expect(html).not.toMatch(/만장일치 승인 권고|의결 로그 페이로드/);
  });

  it('remains non-indexable and responsive', async () => {
    apiMock.mockResolvedValue(projection);
    const html = await renderPage();
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(html).toContain('md:grid-cols-4');
    expect(html).toContain('role="status"');
  });
});
