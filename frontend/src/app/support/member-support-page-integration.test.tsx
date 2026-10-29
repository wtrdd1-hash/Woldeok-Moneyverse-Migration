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
  NewSupportThreadForm: () => <div data-testid="verified-create-support" />,
  SupportReplyForm: ({ threadId }: { threadId: string }) =>
    <div data-testid="verified-reply-support" data-thread-id={threadId} />,
}));

import SupportPage, { metadata } from './page';

const threadId = '4bb16d4d-6d18-4fb6-b581-1d5a716c1e3a';

beforeEach(() => {
  vi.clearAllMocks();
  api.mockImplementation(async (path: string) => {
    if (path === '/api/v1/support/threads') {
      return { threads: [{ thread_id: threadId, subject: 'My ticket', status: 'open', created_at: '', last_message_at: '' }] };
    }
    if (path === `/api/v1/support/threads/${threadId}/messages`) return { messages: [] };
    throw new Error(`Unexpected API request: ${path}`);
  });
});

describe('member support page verified action integration', () => {
  it('renders verified stateful create and reply forms rather than binding two-argument server actions directly', async () => {
    const html = renderToStaticMarkup(await SupportPage({ searchParams: Promise.resolve({ thread: threadId }) }));
    expect(requireMember).toHaveBeenCalledOnce();
    expect(html).toContain('data-testid="verified-create-support"');
    expect(html).toContain('data-testid="verified-reply-support"');
    expect(html).toContain(`data-thread-id="${threadId}"`);
    expect(html).not.toContain('name="threadId"');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('keeps verified create form visible with no threads and does not show a reply form', async () => {
    api.mockResolvedValue({ threads: [] });
    const html = renderToStaticMarkup(await SupportPage({ searchParams: Promise.resolve({}) }));
    expect(html).toContain('data-testid="verified-create-support"');
    expect(html).not.toContain('data-testid="verified-reply-support"');
    expect(api).toHaveBeenCalledTimes(1);
  });
});
