// @vitest-environment node
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HomePage from './page';
import { apiOrNull } from '@/lib/api';
import { getServerLocale } from '@/lib/locale-server';

vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn() }));
vi.mock('@/lib/locale-server', () => ({ getServerLocale: vi.fn() }));
vi.mock('@/components/wallet-glance', () => ({ WalletGlance: () => <span>로그인 필요</span> }));
vi.mock('@/components/p2p-transfer-modal', () => ({ P2PTransferModal: () => <button>송금</button> }));
vi.mock('@/components/translated-text', () => ({ TranslatedText: ({ korean }: { korean: string }) => <>{korean}</> }));

const stocks = vi.mocked(apiOrNull);
const locale = vi.mocked(getServerLocale);

async function renderHome(): Promise<string> {
  return renderToStaticMarkup(await HomePage());
}

describe('P1 homepage guest-first and live stock integrity (#1000)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    locale.mockResolvedValue('ko');
    stocks.mockResolvedValue(null);
  });

  it('renders the public guest paths before the member-only financial cockpit', async () => {
    const html = await renderHome();
    expect(html.indexOf('data-testid="guest-quickstart"')).toBeGreaterThan(0);
    expect(html.indexOf('data-testid="guest-quickstart"')).toBeLessThan(html.indexOf('id="hero-balance-heading"'));
    expect(html).toContain('href="/tools/compound-calculator"');
    expect(html).toContain('href="/guide/glossary"');
    expect(html).toContain('href="/features"');
  });

  it('reports an unavailable stock API without pretending the data is loading', async () => {
    const html = await renderHome();
    expect(html).toContain('시세 자료를 불러오지 못했습니다');
    expect(html).not.toContain('실시간 호가 데이터를 불러오는 중입니다');
    expect(html).toContain('role="status"');
    expect(html).not.toContain('href="/stocks/CHIMU"');
  });

  it('distinguishes a successful but empty stock response from an API failure', async () => {
    stocks.mockResolvedValue({ stocks: [] });
    const html = await renderHome();
    expect(html).toContain('현재 표시할 종목이 없습니다');
    expect(html).not.toContain('시세 자료를 불러오지 못했습니다');
  });

  it('keeps server-sourced stock links and percentages when data is available', async () => {
    stocks.mockResolvedValue({ stocks: [{ symbol: 'WLD', name: '월덕', current_price: '1100', day_open_price: '1000' }] });
    const html = await renderHome();
    expect(html).toContain('href="/stocks/WLD"');
    expect(html).toContain('+10.0%');
    expect(html).not.toContain('시세 자료를 불러오지 못했습니다');
  });

  it.each(['en', 'ja', 'zh'] as const)('preserves %s guest calculator and glossary routes', async (language) => {
    locale.mockResolvedValue(language);
    const html = await renderHome();
    expect(html).toContain(`href="/${language}/tools/compound-interest-calculator"`);
    expect(html).toContain(`href="/${language}/guide/glossary"`);
  });
});
