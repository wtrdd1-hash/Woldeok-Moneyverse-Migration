import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { redirect } from 'next/navigation';
import { apiOrNull } from '@/lib/api';
import { mutate } from '@/lib/mutate';
import ChatPage, { generateMetadata } from './page';

const peerId = '0d432db4-6204-41db-bd25-9fbdcfa8459c';
const conversationId = '749f4f4a-18c2-49cb-975f-87602bce7319';

vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));
vi.mock('@/lib/session', () => ({ requireMember: vi.fn(async () => undefined) }));
vi.mock('@/lib/locale-server', () => ({ getServerLocale: vi.fn(async () => 'ko') }));
vi.mock('@/lib/viewer', () => ({
  currentViewer: vi.fn(async () => ({ id: 'viewer' })),
  isAdministrator: vi.fn(() => false),
}));
vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn(async () => ({ conversations: [] })) }));
vi.mock('@/lib/mutate', () => ({ mutate: vi.fn() }));
vi.mock('@/components/page-header', () => ({
  PageHeader: ({ children }: { children: React.ReactNode }) => <header>{children}</header>,
}));
vi.mock('./chat-view', () => ({ ChatView: () => <div>Member inbox</div> }));
vi.mock('./compose-message-dialog', () => ({ ComposeMessageDialog: () => <button>New message</button> }));

function openPage(params: { peer?: string; conversationId?: string }) {
  return ChatPage({ searchParams: Promise.resolve(params) });
}

describe('direct-message peer navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiOrNull).mockResolvedValue({ conversations: [] });
  });

  it('redirects to the verified conversation after the server confirms creation', async () => {
    vi.mocked(mutate).mockResolvedValue({ conversation_id: conversationId });
    await expect(openPage({ peer: peerId })).rejects.toThrow('NEXT_REDIRECT');
    expect(mutate).toHaveBeenCalledWith('/api/v1/chat/conversations', {
      body: { peerUserId: peerId },
    });
    expect(redirect).toHaveBeenCalledWith('/chat?conversationId=' + conversationId);
  });

  it('does not create a conversation if one is already present', async () => {
    vi.mocked(apiOrNull).mockResolvedValue({
      conversations: [{ conversation_id: conversationId, peer_user_id: peerId }],
    });
    const html = renderToStaticMarkup(await openPage({ peer: peerId }));
    expect(html).toContain('Member inbox');
    expect(mutate).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('announces a failed server open without claiming success', async () => {
    vi.mocked(mutate).mockRejectedValue(new Error('service unavailable'));
    const html = renderToStaticMarkup(await openPage({ peer: peerId }));
    expect(html).toContain('role="alert"');
    expect(html).toContain('대화방을 열 수 없어요');
    expect(redirect).not.toHaveBeenCalled();
  });

  it('rejects malformed peer identifiers before the POST', async () => {
    const html = renderToStaticMarkup(await openPage({ peer: '../not-a-user' }));
    expect(html).toContain('role="alert"');
    expect(mutate).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('never redirects to an unverified server conversation id', async () => {
    vi.mocked(mutate).mockResolvedValue({ conversation_id: '/other-path' });
    const html = renderToStaticMarkup(await openPage({ peer: peerId }));
    expect(html).toContain('role="alert"');
    expect(redirect).not.toHaveBeenCalled();
  });

  it('keeps the private conversation page non-indexable', async () => {
    expect((await generateMetadata()).robots).toEqual({ index: false, follow: false });
  });
});
