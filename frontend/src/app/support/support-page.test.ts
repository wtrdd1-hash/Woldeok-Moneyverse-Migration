import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactElement } from 'react';

vi.mock('@/lib/api', () => ({ api: vi.fn() }));
vi.mock('@/lib/session', () => ({ requireMember: vi.fn() }));

import { api } from '@/lib/api';
import { requireMember } from '@/lib/session';
import SupportPage, { metadata } from './page';

const mockedApi = vi.mocked(api);
const ownedThread = '22222222-2222-4222-8222-222222222222';

type Node = ReactElement<{ children?: unknown; name?: string; value?: string; 'aria-label'?: string }>;

function nodes(value: unknown): Node[] {
  if (Array.isArray(value)) return value.flatMap(nodes);
  if (!value || typeof value !== 'object' || !('type' in value) || !('props' in value)) return [];
  const element = value as Node;
  return [element, ...nodes(element.props.children)];
}

describe('member support page owner-scoped navigation and accessible submission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApi.mockImplementation(async (path) => {
      if (path === '/api/v1/support/threads') {
        return { threads: [{ thread_id: ownedThread, subject: 'My support thread', status: 'open' }] } as never;
      }
      if (path === `/api/v1/support/threads/${ownedThread}/messages`) {
        return { messages: [{ message_id: '33333333-3333-4333-8333-333333333333', sender_kind: 'admin', body: 'We are checking' }] } as never;
      }
      throw new Error('Attempted to read unowned thread');
    });
  });

  it('never fetches an arbitrary thread from a tampered URL', async () => {
    const view = await SupportPage({ searchParams: Promise.resolve({ thread: 'not-my-thread' }) });
    expect(requireMember).toHaveBeenCalledOnce();
    expect(mockedApi.mock.calls.map(([path]) => path)).toEqual([
      '/api/v1/support/threads',
      `/api/v1/support/threads/${ownedThread}/messages`,
    ]);
    expect(nodes(view).some((node) => node.type === 'input' && node.props.name === 'threadId' && node.props.value === ownedThread)).toBe(true);
  });

  it('renders distinct stable receipt keys for create and reply forms with accessible labels', async () => {
    const view = await SupportPage({ searchParams: Promise.resolve({ thread: ownedThread }) });
    const elements = nodes(view);
    const keys = elements.filter((node) => node.type === 'input' && node.props.name === 'idempotencyKey')
      .map((node) => node.props.value);
    expect(keys).toHaveLength(2);
    expect(new Set(keys).size).toBe(2);
    for (const key of keys) {
      expect(key).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    }
    const labels = elements.map((node) => node.props['aria-label']);
    expect(labels).toContain('문의 제목');
    expect(labels).toContain('문의 내용');
    expect(labels).toContain('답장 내용');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
