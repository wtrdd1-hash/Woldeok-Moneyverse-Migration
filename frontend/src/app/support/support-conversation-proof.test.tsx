import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { api, requireMember } = vi.hoisted(() => ({
  api: vi.fn(),
  requireMember: vi.fn(async () => undefined),
}));
vi.mock('@/lib/api', () => ({ api }));
vi.mock('@/lib/session', () => ({ requireMember }));
vi.mock('./member-support-forms', () => ({
  NewSupportThreadForm: () => <div data-testid="create-thread" />,
  SupportReplyForm: () => <div data-testid="reply-thread" />,
}));

import SupportPage from './page';

const threadId = 'cdd32f28-c7f0-491b-b8a7-2bb01dd89080';
const thread = { thread_id: threadId, subject: 'My request', status: 'open', created_at: '2026-11-01T00:00:00Z', last_message_at: '2026-11-01T00:00:00Z' };

beforeEach(() => {
  vi.clearAllMocks();
  api.mockImplementation(async (path: string) => {
    if (path === '/api/v1/support/threads') return { threads: [thread] };
    if (path === `/api/v1/support/threads/${threadId}/messages`) return { messages: [] };
    if (path === '/api/v1/support/threads/summary') return null;
    throw new Error(`Unexpected ${path}`);
  });
});

const page = () => SupportPage({ searchParams: Promise.resolve({ thread: threadId }) });

describe('member support conversation source integrity', () => {
  it('does not render a false empty list or create actions on malformed successful thread response', async () => {
    api.mockImplementation(async (path: string) => path === '/api/v1/support/threads' ? { threads: 'invalid' } : null);
    const html = renderToStaticMarkup(await page());
    expect(html).toContain('문의 목록을 확인할 수 없습니다');
    expect(html).toContain('다시 조회');
    expect(html).not.toContain('조건에 맞는 문의가 없습니다');
    expect(html).not.toContain('data-testid="create-thread"');
    expect(html).not.toContain('data-testid="reply-thread"');
    expect(api).not.toHaveBeenCalledWith(expect.stringContaining('/messages'));
  });

  it('fails closed when thread retrieval throws instead of crashing the whole page', async () => {
    api.mockRejectedValue(new Error('backend unavailable'));
    const html = renderToStaticMarkup(await page());
    expect(html).toContain('문의 목록을 확인할 수 없습니다');
    expect(html).not.toContain('data-testid="reply-thread"');
  });

  it('does not render or allow replying to malformed message history', async () => {
    api.mockImplementation(async (path: string) => path.endsWith('/messages') ? { messages: [{ message_id: 'm1', sender_kind: 'operator', body: 'forged admin', created_at: '2026-11-01T00:00:00Z' }] } : path.endsWith('/summary') ? null : { threads: [thread] });
    const html = renderToStaticMarkup(await page());
    expect(html).toContain('대화 내역을 확인할 수 없습니다');
    expect(html).not.toContain('forged admin');
    expect(html).not.toContain('data-testid="reply-thread"');
    expect(html).not.toContain('대화 내역 CSV 다운로드');
  });

  it('does not confuse a message API outage with verified empty history', async () => {
    api.mockImplementation(async (path: string) => path.endsWith('/messages') ? Promise.reject(new Error('503')) : path.endsWith('/summary') ? null : { threads: [thread] });
    const html = renderToStaticMarkup(await page());
    expect(html).toContain('대화 내역을 확인할 수 없습니다');
    expect(html).not.toContain('data-testid="reply-thread"');
  });

  it('preserves verified empty history and reply actions when API returns an empty array', async () => {
    const html = renderToStaticMarkup(await page());
    expect(html).toContain('data-testid="reply-thread"');
    expect(html).toContain('대화 내역 CSV 다운로드');
    expect(html).not.toContain('대화 내역을 확인할 수 없습니다');
  });
});
