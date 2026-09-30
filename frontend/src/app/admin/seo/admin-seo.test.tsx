import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SeoClientView, type SeoInitialData } from './seo-client-view';

const mockInitialData: SeoInitialData = {
  totalHits24h: 124,
  totalHits7d: 842,
  avgDurationMs: 42,
  botDistribution: { Googlebot: 68, 'Naver Yeti': 34, Bingbot: 16 },
  statusDistribution: { '200': 118, '304': 4, '404': 2 },
  stockCoverage: { indexed: 10, total: 10 },
  guideCoverage: { indexed: 5, total: 5 },
  targetUrls: [
    {
      path: '/stocks/CHIPS',
      category: 'stock',
      name: '침팬지 반도체 (CHIPS)',
      lastVisitedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      lastBot: 'Googlebot',
      lastStatusCode: 200,
      healthStatus: 'healthy',
    },
    {
      path: '/guide/stock-trading',
      category: 'guide',
      name: '가상 주식 실전 매매 가이드',
      lastVisitedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      lastBot: 'Naver Yeti',
      lastStatusCode: 200,
      healthStatus: 'healthy',
    },
    {
      path: '/',
      category: 'hub',
      name: '월덕 머니버스 메인 포털',
      lastVisitedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      lastBot: 'Googlebot',
      lastStatusCode: 200,
      healthStatus: 'healthy',
    },
  ],
  recentLogs: [
    {
      id: 'log-1',
      botName: 'Googlebot',
      path: '/stocks/CHIPS',
      statusCode: 200,
      durationMs: 42,
      ipAddress: '66.249.66.1',
      userAgent: 'Mozilla/5.0 Googlebot',
      createdAt: new Date().toISOString(),
    },
  ],
  indexNowKey: 'test-key-2026',
  sitemapUrl: 'https://easy-scraping.com/sitemap.xml',
};

describe('SeoClientView', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders all 4 hero KPI widgets and metrics correctly', () => {
    render(<SeoClientView initialData={mockInitialData} />);

    expect(screen.getByText('24시간 봇 크롤링')).toBeTruthy();
    expect(screen.getAllByText('124')[0]).toBeTruthy();
    expect(screen.getByText('Google AdSense 광고 수익화 & 트래픽 관제 타워')).toBeTruthy();
    expect(screen.getByText('10대 가상 주식 색인율')).toBeTruthy();
    expect(screen.getByText('10 / 10')).toBeTruthy();
    expect(screen.getByText('5대 금융 가이드 색인율')).toBeTruthy();
    expect(screen.getByText('5 / 5')).toBeTruthy();
    expect(screen.getByText('42')).toBeTruthy();
  });

  it('renders target URL cards with health badges and names', () => {
    render(<SeoClientView initialData={mockInitialData} />);

    expect(screen.getByText('침팬지 반도체 (CHIPS)')).toBeTruthy();
    expect(screen.getAllByText('/stocks/CHIPS')[0]).toBeTruthy();
    expect(screen.getByText('가상 주식 실전 매매 가이드')).toBeTruthy();
    expect(screen.getAllByText('/guide/stock-trading')[0]).toBeTruthy();
  });

  it('filters target cards by category button click', () => {
    render(<SeoClientView initialData={mockInitialData} />);

    const stockFilterBtn = screen.getByRole('button', { name: '가상 주식 (10)' });
    fireEvent.click(stockFilterBtn);

    expect(screen.getByText('침팬지 반도체 (CHIPS)')).toBeTruthy();
    expect(screen.queryByText('가상 주식 실전 매매 가이드')).toBeNull();
  });

  it('handles manual submission ping button click with feedback', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        submittedUrls: ['https://easy-scraping.com/stocks/CHIPS'],
      }),
    });

    render(<SeoClientView initialData={mockInitialData} />);

    const submitBtn = screen.getByRole('button', { name: /전체 사이트맵 즉시 제출/i });
    fireEvent.click(submitBtn);

    const feedback = await screen.findByText(/전송 완료!/i);
    expect(feedback).toBeTruthy();
  });

  it('renders Google Search Console Search Analytics card with metrics', () => {
    render(<SeoClientView initialData={mockInitialData} />);

    expect(screen.getByText(/Google Search Console 검색 성과 분석/i)).toBeTruthy();
    expect(screen.getByText('30일간 검색 트렌드 추이')).toBeTruthy();
    expect(screen.getByText('상위 10대 유입 검색어 (Top Search Queries)')).toBeTruthy();
    expect(screen.getByRole('button', { name: /서비스 계정 키 설정/i })).toBeTruthy();
  });
});

