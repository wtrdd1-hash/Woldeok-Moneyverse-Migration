import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const { publicApiMock } = vi.hoisted(() => ({ publicApiMock: vi.fn() }));
vi.mock('@/lib/api', () => ({ publicApi: publicApiMock }));
vi.mock('@/lib/seo', () => ({ canonicalUrl: (p: string) => `https://easy-scraping.com${p}` }));

import PublicMintPage, { metadata } from './page';

describe('PublicMintPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders seigniorage ledger and burn certificates when publicApi returns data', async () => {
    publicApiMock.mockImplementation(async (path: string) => {
      if (path.includes('seigniorage')) {
        return {
          nationalMintAuthority: '대한민국 국가조폐국 (Woldeok National Mint Bureau)',
          jurisdiction: 'Woldeok Sovereign Monetary Zone',
          totalMintedM0Wld: '500000000',
          totalProductionCostWld: '100000',
          totalCumulativeSeigniorageWld: '499900000',
          totalBurnedDestroyedWld: '50000',
          netCirculationExpansionWld: '499950000',
          activeMintBatchesCount: 12,
          burnCertificatesCount: 1,
          lastAuditedAt: '2026-11-08T12:00:00Z',
        };
      }
      if (path.includes('audit-certificates')) {
        return [
          {
            id: 'burn-1',
            certificateNumber: 'BURN-202611-001',
            amountWld: '50000',
            sinkCategory: 'TREASURY_SINK',
            burnReason: '초과 유동성 흡수',
            burnedBy: 'admin-user',
            cryptographicProof: 'sha256:abcdef1234567890',
            burnedAt: '2026-11-08T10:00:00Z',
          },
        ];
      }
      return null;
    });

    const html = renderToStaticMarkup(await PublicMintPage());
    expect(html).toContain('한국조폐공사 본원통화 발행 및 소각 공시');
    expect(html).toContain('500,000,000 WLD');
    expect(html).toContain('BURN-202611-001');
    expect(html).toContain('-50,000 WLD');
    expect(metadata.robots).toEqual({ index: true, follow: true });
  });

  it('renders gracefully when no certificates exist or publicApi returns null', async () => {
    publicApiMock.mockResolvedValue(null);

    const html = renderToStaticMarkup(await PublicMintPage());
    expect(html).toContain('한국조폐공사 본원통화 발행 및 소각 공시');
    expect(html).toContain('0 WLD');
    expect(html).toContain('현재 집행된 영구 소각 내역이 원장에 없습니다.');
  });
});
