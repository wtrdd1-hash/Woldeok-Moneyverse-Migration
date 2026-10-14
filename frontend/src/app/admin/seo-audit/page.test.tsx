import { describe, it, expect, vi } from 'vitest';
const gate = vi.hoisted(() => vi.fn());
vi.mock('@/lib/session', () => ({ requireAdminConsole: gate }));
vi.mock('@/components/admin-seo-audit-view', () => ({ AdminSeoAuditView: () => null }));
import Page from './page';
describe('SEO audit page', () => { it('checks admin console', async () => { await Page(); expect(gate).toHaveBeenCalledWith('/admin/seo-audit'); }); });
