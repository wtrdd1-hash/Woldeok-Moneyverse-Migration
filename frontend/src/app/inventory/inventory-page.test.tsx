import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock, requireMemberMock } = vi.hoisted(() => ({
  apiMock: vi.fn(),
  requireMemberMock: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  api: apiMock,
  apiOrNull: async (path: string) => {
    try { return await apiMock(path); } catch { return null; }
  },
}));
vi.mock('@/lib/session', () => ({ requireMember: requireMemberMock }));
vi.mock('@/components/page-header', () => ({
  PageHeader: ({ children }: { children: unknown }) => children,
  Accent: ({ children }: { children: unknown }) => children,
}));
vi.mock('@/components/translated-text', () => ({ TranslatedText: () => null }));
vi.mock('./inventory-view', () => ({ InventoryView: () => null }));

import InventoryPage from './page';

describe('member inventory source truth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireMemberMock.mockResolvedValue(undefined);
  });

  it('does not present an upstream holdings failure as an empty inventory', async () => {
    apiMock.mockImplementation(async (path: string) => {
      if (path === '/api/v1/shop/holdings') throw new Error('holdings unavailable');
      return { chosenName: 'member' };
    });
    await expect(InventoryPage()).rejects.toThrow('holdings unavailable');
  });

  it('accepts an explicitly verified empty holdings response', async () => {
    apiMock.mockImplementation(async (path: string) =>
      path === '/api/v1/shop/holdings' ? { holdings: [] } : { chosenName: 'member' },
    );
    await expect(InventoryPage()).resolves.toBeTruthy();
  });
});
