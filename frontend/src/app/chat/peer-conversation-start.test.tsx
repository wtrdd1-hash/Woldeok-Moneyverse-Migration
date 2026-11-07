import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { openConversationAction, replace } = vi.hoisted(() => ({
  openConversationAction: vi.fn(),
  replace: vi.fn(),
}));

vi.mock('./actions', () => ({ openConversationAction }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));

import { PeerConversationStart } from './peer-conversation-start';

const peer = '123e4567-e89b-42d3-a456-426614174001';
const room = '123e4567-e89b-42d3-a456-426614174000';

describe('explicit peer conversation start', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('never writes on render and opens only on explicit keyboard-accessible form submission', async () => {
    openConversationAction.mockResolvedValue({ status: 'ok', conversationId: room });
    const { container } = render(<PeerConversationStart peerUserId={peer} locale="ko" />);
    expect(openConversationAction).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: '대화방 열기' }).getAttribute('type')).toBe('submit');
    expect(screen.getByRole('button', { name: '대화방 열기' }).className).toContain('min-h-11');
    await act(async () => { fireEvent.submit(container.querySelector('form')!); });
    expect(openConversationAction).toHaveBeenCalledTimes(1);
    const submitted = openConversationAction.mock.calls[0]?.[1] as FormData;
    expect(submitted.get('peerUserId')).toBe(peer);
    await waitFor(() => expect(replace).toHaveBeenCalledWith(`/chat?conversationId=${room}`));
  });

  it('shows a verification warning instead of navigating on an invalid success receipt', async () => {
    openConversationAction.mockResolvedValue({ status: 'ok', conversationId: 'not-a-uuid' });
    const { container } = render(<PeerConversationStart peerUserId={peer} locale="en" />);
    await act(async () => { fireEvent.submit(container.querySelector('form')!); });
    expect(screen.getByRole('alert').textContent).toContain('confirmation is unavailable');
    expect(replace).not.toHaveBeenCalled();
  });

  it('does not navigate on rejected or malformed server receipts', async () => {
    openConversationAction.mockResolvedValue({ status: 'error', message: 'No permission' });
    const { container } = render(<PeerConversationStart peerUserId={peer} locale="en" />);
    await act(async () => { fireEvent.submit(container.querySelector('form')!); });
    expect(screen.getByRole('alert').textContent).toContain('No permission');
    expect(replace).not.toHaveBeenCalled();
  });
});
