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
vi.mock('@/components/admin/central-bank-panel', () => ({
  CentralBankPanel: () => <div data-testid="central-bank-panel">CENTRAL_BANK_PANEL_MOUNTED</div>,
}));

import AdminCentralBankPage, { metadata } from './page';

describe('AdminCentralBankPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminMock.mockResolvedValue(undefined);
  });

  it('requires admin console authentication and renders CentralBankPanel', async () => {
    const html = renderToStaticMarkup(await AdminCentralBankPage());
    expect(adminMock).toHaveBeenCalledWith('/admin/central-bank');
    expect(html).toContain('한국은행 (BOK) 금융통화위원회');
    expect(html).toContain('CENTRAL_BANK_PANEL_MOUNTED');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
