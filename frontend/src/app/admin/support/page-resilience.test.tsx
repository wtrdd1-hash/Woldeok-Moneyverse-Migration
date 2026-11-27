import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('@/lib/session', () => ({ requireAdminConsole: vi.fn(async () => undefined) }));
const apiOrNull = vi.hoisted(() => vi.fn());
vi.mock('@/lib/api', () => ({ apiOrNull, api: vi.fn(async () => { throw new Error('api() must not be used here'); }) }));
vi.mock('./admin-support-view', () => ({ AdminSupportView: () => 'VIEW' }));

const { default: Page } = await import('./page');

// W03 admin QA: an unreachable thread list threw inside the server component and the whole console
// page failed (React #441 in the browser). An unreadable source is an honest unavailable state.
describe('admin support page resilience', () => {
  it('renders an unavailable state instead of throwing when the thread list cannot be read', async () => {
    apiOrNull.mockResolvedValueOnce(null);
    const html = renderToStaticMarkup(await Page({ searchParams: Promise.resolve({}) }));
    expect(html).not.toContain('VIEW');
    expect(html).toContain('data-support-unavailable');
  });

  it('renders the console when the list is readable', async () => {
    apiOrNull.mockResolvedValueOnce({ threads: [] });
    const html = renderToStaticMarkup(await Page({ searchParams: Promise.resolve({}) }));
    expect(html).toContain('VIEW');
  });
});

describe('admin support page message failure', () => {
  it('does not show an unreadable conversation as empty', async () => {
    apiOrNull.mockResolvedValueOnce({ threads: [{ thread_id: '00000000-0000-4000-8000-000000000001' }] }).mockResolvedValueOnce(null);
    const html = renderToStaticMarkup(await Page({ searchParams: Promise.resolve({}) }));
    expect(html).toContain('data-support-unavailable');
  });
});
