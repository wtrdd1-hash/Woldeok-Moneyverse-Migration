import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

const adminGate = vi.hoisted(() => vi.fn(async () => undefined));
vi.mock('@/lib/session', () => ({ requireAdminConsole: adminGate }));
vi.mock('@/lib/locale-server', () => ({ getServerLocale: async () => 'en' }));
vi.mock('@/lib/api', () => ({ apiOrNull: async () => null }));
vi.mock('@/components/page-header', () => ({ PageHeader: ({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) => <div>{eyebrow}{title}{children}</div> }));
vi.mock('@/components/ui/button', () => ({ Button: ({ children }: { children: React.ReactNode }) => <span>{children}</span> }));
vi.mock('next/link', () => ({ default: ({ children }: { children: React.ReactNode }) => <span>{children}</span> }));
vi.mock('./api-health-dashboard', () => ({ ApiHealthDashboard: () => null }));
import AdminApiHealthPage from './page';

describe('admin API health page evidence', () => {
  it('keeps admin authorization and does not describe unmeasured routes as verified live telemetry', async () => {
    const html = renderToStaticMarkup(await AdminApiHealthPage());
    expect(adminGate).toHaveBeenCalledWith('/admin/api-health');
    expect(html).toContain('unmeasured');
    expect(html).not.toContain('Real-Time Health Tower');
    expect(html).not.toContain('verified for healthy entertainment standards');
  });
});
