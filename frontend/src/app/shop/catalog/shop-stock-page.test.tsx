// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { apiOrNull } from '@/lib/api';
import ShopCatalogPage from './page';

vi.mock('@/lib/session', () => ({ requireMember: vi.fn(async () => undefined) }));
vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn(async () => null) }));

beforeEach(() => vi.mocked(apiOrNull).mockReset());

describe('member shop stock search form', () => {
  it('requests the server-side sold-out filter, exposes an accessible selection and distinguishes read errors', async () => {
    vi.mocked(apiOrNull).mockResolvedValue(null);
    const html = renderToStaticMarkup(await ShopCatalogPage({
      searchParams: Promise.resolve({ q: '한정판', stock: 'sold_out' }),
    }));
    expect(apiOrNull).toHaveBeenCalledWith('/api/v1/shop/catalog?stock=sold_out');
    expect(html).toContain('name="stock"');
    expect(html).toContain('품절만 보기');
    expect(html).toContain('상점 목록을 불러오지 못했어요');
    expect(html).not.toContain('현재 품절로 확인된 아이템이 없어요.');
  });
  it('shows a verified sold-out empty state only after an actual catalogue response', async () => {
    vi.mocked(apiOrNull).mockImplementation(async (path) => typeof path === 'string' && path.startsWith('/api/v1/shop/catalog')
      ? { catalogItems: [] } as never
      : null);
    const html = renderToStaticMarkup(await ShopCatalogPage({
      searchParams: Promise.resolve({ stock: 'sold_out' }),
    }));
    expect(html).toContain('현재 품절로 확인된 아이템이 없어요.');
  });
});
