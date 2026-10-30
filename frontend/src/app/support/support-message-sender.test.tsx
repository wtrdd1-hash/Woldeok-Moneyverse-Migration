import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const { api, requireMember } = vi.hoisted(() => ({ api: vi.fn(), requireMember: vi.fn(async () => undefined) }));
vi.mock('@/lib/api', () => ({ api }));
vi.mock('@/lib/session', () => ({ requireMember }));
vi.mock('./member-support-forms', () => ({ NewSupportThreadForm: () => <div />, SupportReplyForm: () => <div /> }));
import SupportPage from './page';
const thread = '22222222-2222-4222-8222-222222222222';
const row = { message_id: '11111111-1111-4111-8111-111111111111', sender_kind: 'admin', body: '관리자 답변', created_at: '2026-10-30T00:00:00Z' };
beforeEach(() => {
  vi.clearAllMocks();
  api.mockImplementation(async (path: string) => {
    if (path.includes('/messages')) return { messages: [row] };
    if (path.includes('/summary')) return { open: 1, waitingUser: 0, resolved: 0, scanned: 1, mayBeIncomplete: false };
    return { threads: [{ thread_id: thread, subject: '문의', status: 'open', created_at: row.created_at, last_message_at: row.created_at }] };
  });
});
describe('member support sender UI', () => {
  it('passes the sender filter to the owner API and preserves selected thread', async () => {
    const html = renderToStaticMarkup(await SupportPage({ searchParams: Promise.resolve({ thread, sender: 'admin' }) }));
    expect(api).toHaveBeenCalledWith(`/api/v1/support/threads/${thread}/messages?sender=admin`);
    expect(html).toContain('id="support-message-sender"');
    expect(html).toContain('name="thread"');
    expect(html).toContain('관리자 답변');
    expect(html).toContain('처음 최대 200개');
  });
  it('does not show forged wrong-sender messages as a successful empty search', async () => {
    const html = renderToStaticMarkup(await SupportPage({ searchParams: Promise.resolve({ thread, sender: 'user' }) }));
    expect(html).toContain('메시지 검색 결과를 검증할 수 없습니다');
    expect(html).not.toContain('관리자 답변</p>');
  });
});
