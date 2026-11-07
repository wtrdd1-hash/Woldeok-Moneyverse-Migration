import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api, apiOrNull } from '@/lib/api';
import { requireMember } from '@/lib/session';
import InventoryPage from './page';

vi.mock('@/lib/api', () => ({ api: vi.fn(), apiOrNull: vi.fn() }));
vi.mock('@/lib/session', () => ({ requireMember: vi.fn() }));
vi.mock('./inventory-view', () => ({
  InventoryView: ({ holdings }: { holdings: unknown[] }) =>
    React.createElement('div', { 'data-testid': 'verified-inventory', 'data-count': holdings.length }),
}));
vi.mock('@/components/page-header', () => ({
  PageHeader: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  Accent: ({ children }: { children: React.ReactNode }) => React.createElement('span', null, children),
}));
vi.mock('@/components/translated-text', () => ({
  TranslatedText: ({ korean }: { korean: string }) => React.createElement('span', null, korean),
}));

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(requireMember).mockResolvedValue(undefined as never);
  vi.mocked(apiOrNull).mockResolvedValue({ chosenName: '모험가' });
});
describe('authenticated inventory truth', () => {
  it('renders verified empty holdings as a genuine empty inventory', async () => {
    vi.mocked(api).mockResolvedValue({ holdings: [] });
    const html = renderToStaticMarkup(await InventoryPage());
    expect(html).toContain('data-testid="verified-inventory"');
    expect(html).toContain('data-count="0"');
    expect(html).not.toContain('보관함을 불러올 수 없습니다');
  });
  it('does not fabricate empty inventory when upstream fails', async () => {
    vi.mocked(api).mockRejectedValue(new Error('backend offline'));
    const html = renderToStaticMarkup(await InventoryPage());
    expect(html).toContain('보관함을 불러올 수 없습니다');
    expect(html).toContain('href="/inventory"');
    expect(html).not.toContain('data-testid="verified-inventory"');
  });
  it('does not fabricate empty inventory on malformed HTTP 200', async () => {
    vi.mocked(api).mockResolvedValue({ ok: true });
    const html = renderToStaticMarkup(await InventoryPage());
    expect(html).toContain('보관함을 불러올 수 없습니다');
    expect(html).not.toContain('data-testid="verified-inventory"');
  });
});
