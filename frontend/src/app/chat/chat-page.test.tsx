import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const { apiOrNull, mutate, redirect } = vi.hoisted(() => ({
  apiOrNull: vi.fn(),
  mutate: vi.fn(),
  redirect: vi.fn(() => { throw new Error('NEXT_REDIRECT'); }),
}));

vi.mock('@/lib/api', () => ({ apiOrNull }));
vi.mock('@/lib/mutate', () => ({ mutate }));
vi.mock('@/lib/session', () => ({ requireMember: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/lib/locale-server', () => ({ getServerLocale: vi.fn().mockResolvedValue('ko') }));
vi.mock('@/lib/viewer', () => ({ currentViewer: vi.fn().mockResolvedValue({}), isAdministrator: vi.fn().mockReturnValue(false) }));
vi.mock('next/navigation', () => ({ redirect }));
vi.mock('./chat-view', () => ({ ChatView: () => <div data-testid="verified-inbox" /> }));
vi.mock('./compose-message-dialog', () => ({ ComposeMessageDialog: () => null }));

import ChatPage from './page';

const conversationId = '123e4567-e89b-42d3-a456-426614174000';
const peerId = '123e4567-e89b-42d3-a456-426614174001';
const conversation = {
  conversation_id: conversationId, state: 'active', latest_sequence: '0',
  last_message_at: null, created_at: '2026-10-31T10:00:00.000Z',
  peer_user_id: peerId, peer_display_name: 'Member', peer_avatar_key: null,
  last_read_sequence: '0', unread_count: '0', muted: false, archived: false,
  last_message_body: null,
};
const render = async (query: { conversationId?: string; peer?: string } = {}) =>
  renderToStaticMarkup(await ChatPage({ searchParams: Promise.resolve(query) }));

describe('chat page read-integrity boundary', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('does not show a verified empty inbox or create a peer conversation when list fetch fails', async () => {
    apiOrNull.mockResolvedValue(null);
    const html = await render({ peer: peerId });
    expect(html).toContain('role="alert"');
    expect(html).toContain('쪽지 기록을 확인할 수 없습니다');
    expect(html).toContain('다시 확인');
    expect(html).not.toContain('data-testid="verified-inbox"');
    expect(mutate).not.toHaveBeenCalled();
  });

  it('renders a verified empty inbox without a fabricated failure', async () => {
    apiOrNull.mockResolvedValue({ conversations: [], totalUnread: '0' });
    const html = await render();
    expect(html).toContain('data-testid="verified-inbox"');
    expect(html).not.toContain('role="alert"');
  });

  it('rejects a malformed list rather than attempting to open a peer conversation', async () => {
    apiOrNull.mockResolvedValue({ conversations: [{ conversation_id: 'bad' }] });
    expect(await render({ peer: peerId })).toContain('role="alert"');
    expect(mutate).not.toHaveBeenCalled();
  });

  it('does not render a message room when message history is unavailable', async () => {
    apiOrNull.mockResolvedValueOnce({ conversations: [conversation] }).mockResolvedValueOnce(null);
    const html = await render({ conversationId });
    expect(html).toContain('role="alert"');
    expect(html).not.toContain('data-testid="verified-inbox"');
  });

  it('redirects only after a verified peer open receipt', async () => {
    apiOrNull.mockResolvedValue({ conversations: [] });
    mutate.mockResolvedValue({ conversation_id: conversationId });
    await expect(render({ peer: peerId })).rejects.toThrow('NEXT_REDIRECT');
    expect(redirect).toHaveBeenCalledWith(`/chat?conversationId=${conversationId}`);
  });
});
