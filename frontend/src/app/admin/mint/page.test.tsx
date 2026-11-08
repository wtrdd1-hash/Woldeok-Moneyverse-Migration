import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const { adminMock } = vi.hoisted(() => ({ adminMock: vi.fn() }));
vi.mock('@/lib/session', () => ({ requireAdminConsole: adminMock }));
vi.mock('@/components/page-header', () => ({
  PageHeader: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <header><h1>{title}</h1><div>{children}</div></header>
  ),
}));
vi.mock('../admin-back', () => ({ AdminBack: () => <div>Back</div> }));
vi.mock('@/components/admin/national-mint-panel', () => ({
  NationalMintPanel: () => <div data-testid="national-mint-panel">MINT_PANEL_MOUNTED</div>,
}));

import AdminMintPage, { metadata } from './page';

describe('AdminMintPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminMock.mockResolvedValue(undefined);
  });

  it('requires admin console authentication and renders NationalMintPanel', async () => {
    const html = renderToStaticMarkup(await AdminMintPage());
    expect(adminMock).toHaveBeenCalledWith('/admin/mint');
    expect(html).toContain('한국조폐공사 (KOMSCO)');
    expect(html).toContain('MINT_PANEL_MOUNTED');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
