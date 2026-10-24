import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import { NotificationTabsBar } from './notification-tabs-bar';

const id = '8c78d92c-12a5-45f0-91dd-c1c7f50bd713';
const item = { id, category: 'TRANSACTIONAL', title: '거래 안내', body: '1,840 WLD 지급 완료', is_read: false, created_at: '2026-10-25T00:00:00Z' };
const response = (payload: unknown, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => payload }) as Response;

beforeEach(() => vi.stubGlobal('fetch', vi.fn()));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('verified member notification inbox', () => {
  it('loads owner-scoped API feed and never shows fabricated WLD settlements', async () => {
    vi.mocked(fetch).mockResolvedValue(response({ notifications: [item] }));
    render(<NotificationTabsBar />);
    expect(screen.queryByText(/20 WLD|1,840 WLD|시즌 1: First Capital/)).toBeNull();
    expect(await screen.findByRole('heading', { name: '금융 관련 알림' })).toBeDefined();
    expect(screen.getByText(/거래 내역에서 확인/)).toBeDefined();
    expect(screen.queryByText('1,840 WLD 지급 완료')).toBeNull();
    expect(screen.getByRole('link', { name: /지갑 거래 내역/ }).getAttribute('href')).toBe('/wallet/activity');
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toContain('/api/notifications');
  });

  it('does not repeat an unverified WLD payout claim in the title or accessible read action', async () => {
    vi.mocked(fetch).mockResolvedValue(response({ notifications: [{ ...item, title: '1,840 WLD 지급 완료' }] }));
    render(<NotificationTabsBar />);
    expect(await screen.findByRole('heading', { name: '금융 관련 알림' })).toBeDefined();
    expect(screen.queryByText('1,840 WLD 지급 완료')).toBeNull();
    expect(screen.getByRole('button', { name: '읽음 처리: 금융 관련 알림' })).toBeDefined();
  });

  it('distinguishes an empty verified feed from a failed feed and retries', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(response({}, 503)).mockResolvedValueOnce(response({ notifications: [] }));
    render(<NotificationTabsBar />);
    expect(await screen.findByRole('alert')).toBeDefined();
    expect(screen.queryByText('알림 내역이 없습니다.')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(await screen.findByText('알림 내역이 없습니다.')).toBeDefined();
  });

  it('marks a single notification read only after the server receipt and refreshed feed', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(response({ notifications: [item] }))
      .mockResolvedValueOnce(response({ read: true }))
      .mockResolvedValueOnce(response({ notifications: [{ ...item, is_read: true }] }));
    render(<NotificationTabsBar />);
    fireEvent.click(await screen.findByRole('button', { name: /읽음 처리: 금융 관련 알림/ }));
    await waitFor(() => expect(screen.queryByRole('button', { name: /읽음 처리: 금융 관련 알림/ })).toBeNull());
    expect(vi.mocked(fetch).mock.calls[1]?.[1]).toMatchObject({ method: 'POST' });
    expect(JSON.parse(String(vi.mocked(fetch).mock.calls[1]?.[1]?.body))).toEqual({ notificationId: id });
    expect(vi.mocked(fetch).mock.calls[2]?.[0]).toContain('/api/notifications');
  });

  it('rejects malformed mark-all receipts and does not claim a read success', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(response({ notifications: [item] }))
      .mockResolvedValueOnce(response({ updatedCount: '1' }));
    render(<NotificationTabsBar />);
    fireEvent.click(await screen.findByRole('button', { name: /모두 읽음/ }));
    expect(await screen.findByRole('alert')).toBeDefined();
    expect(screen.getByRole('button', { name: /읽음 처리: 금융 관련 알림/ })).toBeDefined();
  });

  it('offers keyboard-accessible category filters and mobile touch targets', async () => {
    vi.mocked(fetch).mockResolvedValue(response({ notifications: [item, { ...item, id: 'a28e8a22-f589-4ec2-90d4-56b4a4302a2c', category: 'SECURITY_CRITICAL', title: '새 로그인', body: '확인하세요' }] }));
    render(<NotificationTabsBar />);
    expect(await screen.findByRole('heading', { name: '금융 관련 알림' })).toBeDefined();
    const security = screen.getByRole('button', { name: /보안/ });
    expect(security.className).toContain('min-h-11');
    fireEvent.click(security);
    expect(screen.getByText('새 로그인')).toBeDefined();
    expect(screen.queryByRole('heading', { name: '금융 관련 알림' })).toBeNull();
  });
});
