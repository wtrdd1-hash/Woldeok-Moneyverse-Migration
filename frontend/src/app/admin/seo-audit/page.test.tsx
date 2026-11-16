import { describe, it, expect, vi } from 'vitest';
const { gate, seoGate } = vi.hoisted(() => ({ gate: vi.fn(), seoGate: vi.fn() }));
vi.mock('@/lib/session', () => ({ requireAdminConsole: gate }));
vi.mock('@/lib/admin-seo-authority', () => ({ requireSeoPageOperator: seoGate }));
vi.mock('@/components/admin-seo-audit-view', () => ({ AdminSeoAuditView: () => null }));
import Page from './page';
describe('SEO audit page', () => { it('checks admin console', async () => { await Page(); expect(gate).toHaveBeenCalledWith('/admin/seo-audit'); expect(seoGate).toHaveBeenCalled(); }); });
