import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { P2PTransferModal } from './p2p-transfer-modal';

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  DialogContent: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  DialogHeader: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  DialogTitle: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  DialogDescription: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
  DialogTrigger: ({ children }: React.PropsWithChildren) => <div>{children}</div>,
}));

const alice = { userId: 'c55204b1-f1ba-4e7e-8bce-190ef997c832', displayName: 'Alice Previous' };
const bob = { userId: '0c031a78-f6e9-47e6-bce9-07e9fd965b23', displayName: 'Bob Current' };
const results = (recipients: unknown) => new Response(JSON.stringify({ recipients }), {
  status: 200, headers: { 'content-type': 'application/json' },
});

function deferred() {
  let resolve!: (value: Response) => void;
  const promise = new Promise<Response>((r) => { resolve = r; });
  return { promise, resolve };
}

async function search(query: string) {
  fireEvent.change(screen.getByPlaceholderText('수취인 닉네임을 검색하세요...'), { target: { value: query } });
  await act(async () => { await vi.advanceTimersByTimeAsync(310); });
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('P2P recipient search selection safety', () => {
  it('never lets an older response replace the latest recipient search', async () => {
    const older = deferred();
    const newer = deferred();
    const fetchSpy = vi.fn().mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise);
    vi.stubGlobal('fetch', fetchSpy);
    render(<P2PTransferModal />);
    await search('alice');
    await search('bob');
    await act(async () => { newer.resolve(results([bob])); await newer.promise; });
    expect(screen.getByText('Bob Current')).toBeTruthy();
    await act(async () => { older.resolve(results([alice])); await older.promise; });
    expect(screen.getByText('Bob Current')).toBeTruthy();
    expect(screen.queryByText('Alice Previous')).toBeNull();
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('clears obsolete results immediately and reports a failed lookup', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(results([alice]))
      .mockResolvedValueOnce(new Response('{}', { status: 503 })));
    render(<P2PTransferModal />);
    await search('alice');
    expect(screen.getByText('Alice Previous')).toBeTruthy();
    fireEvent.change(screen.getByPlaceholderText('수취인 닉네임을 검색하세요...'), { target: { value: 'bob' } });
    expect(screen.queryByText('Alice Previous')).toBeNull();
    await act(async () => { await vi.advanceTimersByTimeAsync(310); });
    expect(screen.getByRole('alert').textContent).toContain('검색 결과를 불러올 수 없습니다');
    expect(screen.queryByText('Alice Previous')).toBeNull();
  });

  it('does not query a one-character nickname and aborts in-flight lookup on unmount', async () => {
    const pending = deferred();
    const fetchSpy = vi.fn().mockReturnValue(pending.promise);
    vi.stubGlobal('fetch', fetchSpy);
    const { unmount } = render(<P2PTransferModal />);
    await search('a');
    expect(fetchSpy).not.toHaveBeenCalled();
    await search('alice');
    const signal = (fetchSpy.mock.calls[0]?.[1] as RequestInit).signal;
    expect(signal?.aborted).toBe(false);
    unmount();
    expect(signal?.aborted).toBe(true);
    await act(async () => { pending.resolve(results([alice])); await pending.promise; });
  });

  it('rejects malformed response envelopes instead of presenting an empty successful lookup', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 })));
    render(<P2PTransferModal />);
    await search('alice');
    expect(screen.getByRole('alert').textContent).toContain('검색 결과를 불러올 수 없습니다');
    expect(screen.queryByText('Alice Previous')).toBeNull();
  });

  it('does not allow malformed or oversized backend recipient lists to become selectable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(results([bob, { userId: 'not-uuid', displayName: 'Unsafe' },
      ...Array.from({ length: 15 }, (_, index) => ({ userId: `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`, displayName: `Extra ${index}` }))])));
    render(<P2PTransferModal />);
    await search('bob');
    expect(screen.getByText('Bob Current')).toBeTruthy();
    expect(screen.queryByText('Unsafe')).toBeNull();
    expect(screen.queryByText('Extra 14')).toBeNull();
  });
});
