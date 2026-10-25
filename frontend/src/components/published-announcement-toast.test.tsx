import { act, fireEvent, render, screen, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PublishedAnnouncementToast } from './published-announcement-toast';

const notice = (id: string, title: string) => ({
  announcementId: id,
  title,
  body: 'A verified published notice',
  imageUrl: null,
  imageAltText: null,
  isPinned: false,
  publishedAt: id.startsWith('2222') ? '2026-10-25T02:17:30.000Z' : '2026-10-25T02:15:00.000Z',
});
const a = notice('11111111-1111-4111-8111-111111111111', 'Previously published notice');
const b = notice('22222222-2222-4222-8222-222222222222', 'Verified new notice');

const reply = (announcements: unknown, ok = true) => ({
  ok,
  json: async () => ({ announcements }),
});

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function poll() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(60_000);
  });
  await flush();
}

describe('verified global notice toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-25T02:17:00.000Z'));
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('never fabricates WLD payments, burns or votes during idle time', async () => {
    const fetchMock = vi.fn().mockResolvedValue(reply([]));
    vi.stubGlobal('fetch', fetchMock);
    render(<PublishedAnnouncementToast />);
    await flush();
    await act(async () => { await vi.advanceTimersByTimeAsync(45_000); });
    expect(screen.queryByRole('status')).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/api/content/announcements', {
      method: 'GET',
      cache: 'no-store',
      credentials: 'same-origin',
    });
  });

  it('baselines existing notices and announces only newly published server records with a safe link', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(reply([a]))
      .mockResolvedValueOnce(reply([b, a]));
    vi.stubGlobal('fetch', fetchMock);
    render(<PublishedAnnouncementToast />);
    await flush();
    expect(screen.queryByRole('status')).toBeNull();
    await poll();
    expect(screen.getByRole('status').textContent).toContain('Verified new notice');
    expect(screen.getByRole('link', { name: /Verified new notice/ }).getAttribute('href'))
      .toBe('/announcements/22222222-2222-4222-8222-222222222222');
    expect(screen.getByRole('button', { name: '공지 닫기' }).className).toContain('min-h-11');
    fireEvent.click(screen.getByRole('button', { name: '공지 닫기' }));
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('fails closed on outage and treats the first recovered response as baseline', async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new Error('unavailable'))
      .mockResolvedValueOnce(reply([a]))
      .mockResolvedValueOnce(reply([b, a]));
    vi.stubGlobal('fetch', fetchMock);
    render(<PublishedAnnouncementToast />);
    await flush();
    await poll();
    expect(screen.queryByRole('status')).toBeNull();
    await poll();
    expect(screen.getByRole('status').textContent).toContain('Verified new notice');
  });

  it('rejects malformed or unverified announcements without a misleading toast', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(reply([]))
      .mockResolvedValueOnce(reply([{ ...b, publishedAt: 'not-a-date' }]))
      .mockResolvedValueOnce(reply([b], false));
    vi.stubGlobal('fetch', fetchMock);
    render(<PublishedAnnouncementToast />);
    await flush();
    await poll();
    expect(screen.queryByRole('status')).toBeNull();
    await poll();
    expect(screen.queryByRole('status')).toBeNull();
  });
});
