import type * as NodeCrypto from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const { apiMock, memberMock } = vi.hoisted(() => ({ apiMock: vi.fn(), memberMock: vi.fn() }));
vi.mock('node:crypto', async (importOriginal) => {
  const original = await importOriginal<typeof NodeCrypto>();
  return { ...original, randomUUID: vi.fn(() => 'd92451e0-334e-4dcb-887e-7b6f9327eac9') };
});
vi.mock('@/lib/api', () => ({ apiOrNull: apiMock }));
vi.mock('@/lib/session', () => ({ requireMember: memberMock }));
vi.mock('./actions', () => ({
  createSupportThread: vi.fn(),
  replySupportThread: vi.fn(),
}));

import SupportPage from './page';

const THREAD = 'df02b115-9a0e-4f93-a8f2-4dc8130d7d9a';
const rows = { threads: [{ thread_id: THREAD, subject: '기존 문의', status: 'open', created_at: '2026-10-01', last_message_at: '2026-10-02' }] };

beforeEach(() => { vi.clearAllMocks(); memberMock.mockResolvedValue(undefined); });

describe('member support page', () => {
  it('keeps retry keys in the rendered forms and provides explicit accessible labels', async () => {
    apiMock.mockResolvedValueOnce(rows).mockResolvedValueOnce({ messages: [] });
    render(await SupportPage({ searchParams: Promise.resolve({ thread: THREAD }) }));
    expect(screen.getByLabelText('문의 제목')).toBeDefined();
    expect(screen.getByLabelText('문의 내용')).toBeDefined();
    expect(screen.getByLabelText('답장 내용')).toBeDefined();
    const keys = document.querySelectorAll('input[name="idempotencyKey"]');
    expect(keys).toHaveLength(2);
    expect((keys[0] as HTMLInputElement).value).toMatch(/^[a-f0-9-]{36}$/);
    expect((keys[1] as HTMLInputElement).value).toMatch(/^[a-f0-9-]{36}$/);
  });

  it('does not request a foreign or malformed thread from the backend', async () => {
    apiMock.mockResolvedValueOnce(rows);
    render(await SupportPage({ searchParams: Promise.resolve({ thread: '../../admin' }) }));
    expect(apiMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('alert').textContent).toMatch(/선택한 문의/);
    expect(screen.queryByLabelText('답장 내용')).toBeNull();
  });

  it('blocks new requests and replies when the member thread list cannot be verified', async () => {
    apiMock.mockResolvedValueOnce(null);
    render(await SupportPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole('alert').textContent).toMatch(/접수를 잠시 중단/);
    expect(screen.queryByLabelText('문의 제목')).toBeNull();
    expect(screen.queryByLabelText('답장 내용')).toBeNull();
  });

  it('does not show an empty conversation or reply form when messages API fails', async () => {
    apiMock.mockResolvedValueOnce(rows).mockResolvedValueOnce(null);
    render(await SupportPage({ searchParams: Promise.resolve({ thread: THREAD }) }));
    expect(screen.getByRole('alert').textContent).toMatch(/대화 내용을 확인하지 못했습니다/);
    expect(screen.queryByLabelText('답장 내용')).toBeNull();
  });
});
