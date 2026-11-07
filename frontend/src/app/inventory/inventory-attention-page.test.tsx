import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import InventoryPage from './page';
import { apiOrNull } from '@/lib/api';
vi.mock('@/lib/session', () => ({ requireMember: vi.fn(async () => {}) }));
vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn() }));
vi.mock('./inventory-view', () => ({ InventoryView: ({ holdings, attentionHoldings }: { holdings: unknown[]; attentionHoldings?: unknown[] | null }) =>
  <div data-testid="shelf">full={holdings.length};attention={attentionHoldings === undefined ? 'off' : attentionHoldings === null ? 'unavailable' : attentionHoldings.length}</div> }));
const row = { catalog_id: '11111111-1111-4111-8111-111111111111', suspended: true, unpaid_weeks: 0, arrears_due: '0' };
afterEach(() => { vi.unstubAllEnvs(); vi.resetAllMocks(); });
describe('owner inventory attention page', () => {
  it('renders verified attention separately from the full owner showcase when enabled', async () => {
    vi.stubEnv('INVENTORY_ATTENTION_FILTER_ENABLED', '1');
    vi.mocked(apiOrNull).mockImplementation(async (path: string) => path.includes('filter=attention')
      ? { filter: 'attention', holdings: [row] } as never
      : path.includes('shop/holdings') ? { holdings: [row] } as never : {} as never);
    const html = renderToStaticMarkup(await InventoryPage());
    expect(html).toContain('full=1;attention=1');
    expect(vi.mocked(apiOrNull)).toHaveBeenCalledWith('/api/v1/shop/holdings?filter=attention');
  });
  it('does not turn an unavailable owner source into a false empty shelf', async () => {
    vi.stubEnv('INVENTORY_ATTENTION_FILTER_ENABLED', '1');
    vi.mocked(apiOrNull).mockResolvedValue(null);
    const html = renderToStaticMarkup(await InventoryPage());
    expect(html).toContain('role="alert"');
    expect(html).toContain('보관함 정보를 확인할 수 없습니다');
    expect(html).not.toContain('full=0');
  });
  it('keeps the new feature OFF by default', async () => {
    vi.mocked(apiOrNull).mockImplementation(async (path: string) => path.includes('shop/holdings') ? { holdings: [row] } as never : {} as never);
    const html = renderToStaticMarkup(await InventoryPage());
    expect(html).toContain('full=1;attention=off');
    expect(vi.mocked(apiOrNull)).not.toHaveBeenCalledWith('/api/v1/shop/holdings?filter=attention');
  });
});
