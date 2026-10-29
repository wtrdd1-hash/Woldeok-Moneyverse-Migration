import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const { apiOrNull, requireAdminConsole, getServerLocale } = vi.hoisted(() => ({
  apiOrNull: vi.fn(), requireAdminConsole: vi.fn(), getServerLocale: vi.fn(),
}));
vi.mock('@/lib/api', () => ({ apiOrNull }));
vi.mock('@/lib/session', () => ({ requireAdminConsole }));
vi.mock('@/lib/locale-server', () => ({ getServerLocale }));
import StorageHeadroomPage, { dynamic, metadata } from './page';

const mount = (mountAlias: string) => ({ mountAlias, totalBytes: '10000000000', usedBytes: '8000000000', availableBytes: '1000000000', usedPercent: 89, inodeAvailable: '100', severity: 'EMERGENCY' });

describe('admin storage capacity page privacy and accessibility', () => {
  beforeEach(() => { apiOrNull.mockReset(); requireAdminConsole.mockReset(); getServerLocale.mockResolvedValue('en'); });
  it('is dynamic, non-indexable, guarded and announces UNKNOWN on source failure', async () => {
    apiOrNull.mockResolvedValue(null);
    const html = renderToStaticMarkup(await StorageHeadroomPage());
    expect(dynamic).toBe('force-dynamic');
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
    expect(requireAdminConsole).toHaveBeenCalledWith('/admin/operations/storage');
    expect(html).toContain('role="alert"');
    expect(html).toContain('UNKNOWN');
    expect(html).not.toContain('NORMAL · 0%');
  });
  it('shows verified severity and fixed mount aliases without raw host paths or deletion controls', async () => {
    apiOrNull.mockResolvedValue({ status: 'VERIFIED', sourceKind: 'HOST_SIGNED', freshness: 'FRESH', observedAt: new Date().toISOString(), mounts: [mount('ROOT'), mount('DATA')] });
    const html = renderToStaticMarkup(await StorageHeadroomPage());
    expect(html).toContain('EMERGENCY');
    expect(html).toContain('aria-live="polite"');
    expect(html).not.toContain('/srv/moneyverse-data');
    expect(html).not.toContain('Delete files');
  });
});
