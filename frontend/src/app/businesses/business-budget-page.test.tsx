// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiOrNull } from '@/lib/api';
import BusinessesPage from './page';

vi.mock('@/lib/session', () => ({ requireMember: vi.fn(async () => undefined) }));
vi.mock('@/lib/api', () => ({
  apiOrNull: vi.fn(async (path: string) => {
    if (typeof path !== 'string') return null;
    if (path.startsWith('/api/v1/business-types')) return { businessTypes: [] };
    if (path === '/api/v1/businesses/my-v2') return { businesses: [] };
    return null;
  }),
}));

beforeEach(() => vi.mocked(apiOrNull).mockClear());

describe('member business catalogue budget server integration', () => {
  it('forwards an exact integer string to the owner-only API without numeric coercion', async () => {
    await BusinessesPage({ searchParams: Promise.resolve({ maxCost: '9007199254740993' }) });
    expect(apiOrNull).toHaveBeenCalledWith('/api/v1/business-types?maxCost=9007199254740993');
  });

  it('does not fetch a catalogue on invalid duplicate budget input', async () => {
    await BusinessesPage({ searchParams: Promise.resolve({ maxCost: ['1', '2'] }) });
    const paths = vi.mocked(apiOrNull).mock.calls.map(([path]) => path);
    expect(paths).not.toContain('/api/v1/business-types');
    expect(paths.every((path) => !path.startsWith('/api/v1/business-types?'))).toBe(true);
  });

  it('retains unfiltered backwards compatibility', async () => {
    await BusinessesPage({ searchParams: Promise.resolve({}) });
    expect(apiOrNull).toHaveBeenCalledWith('/api/v1/business-types');
  });
});
