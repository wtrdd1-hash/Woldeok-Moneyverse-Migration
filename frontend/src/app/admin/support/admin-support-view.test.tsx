import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';
import { adminSupportReply } from './actions';
import { AdminSupportView, type AdminSupportThread, type AdminSupportMessage } from './admin-support-view';

vi.mock('./actions', () => ({ adminSupportReply: vi.fn(), adminSupportStatus: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
  }),
}));

vi.mock('@/lib/audio/synth-sound', () => ({
  synthSound: {
    playMessageSent: vi.fn(),
    playClick: vi.fn(),
    playNotificationChime: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const mockThreads: AdminSupportThread[] = [
  {
    thread_id: 'thread-1',
    user_id: 'user-uuid-1',
    display_name: '홍길동',
    subject: 'WLD 출금 문의',
    status: 'open',
    created_at: '2026-10-01T01:00:00.000Z',
    last_message_at: '2026-10-01T01:05:00.000Z',
  },
  {
    thread_id: 'thread-2',
    user_id: 'user-uuid-2',
    display_name: '김철수',
    subject: '계정 연동 질문',
    status: 'waiting_user',
    created_at: '2026-10-01T00:30:00.000Z',
    last_message_at: '2026-10-01T00:35:00.000Z',
  },
];

const mockMessages: AdminSupportMessage[] = [
  {
    message_id: 'msg-1',
    sender_kind: 'user',
    sender_user_id: 'user-uuid-1',
    body: '출금 신청을 했는데 아직 처리가 안 되었습니다.',
    created_at: '2026-10-01T01:00:00.000Z',
  },
];

describe('AdminSupportView component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders threads list and chat timeline accurately', () => {
    render(
      <AdminSupportView
        initialThreads={mockThreads}
        initialMessages={mockMessages}
        selectedId="thread-1"
        initialStatus={null}
      />
    );

    expect(screen.getByText('관리자 고객지원 관제 센터')).toBeDefined();
    expect(screen.getAllByText('WLD 출금 문의').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('김철수')).toBeDefined();
    expect(screen.getByText('출금 신청을 했는데 아직 처리가 안 되었습니다.')).toBeDefined();
    expect(screen.getByLabelText('관리자 답장')).toBeDefined();
    expect(screen.getByLabelText('문의 처리 상태')).toBeDefined();
  });

  it('filters threads by search input query', () => {
    render(
      <AdminSupportView
        initialThreads={mockThreads}
        initialMessages={mockMessages}
        selectedId="thread-1"
        initialStatus={null}
      />
    );

    const searchInput = screen.getByPlaceholderText('회원 닉네임, 문의 제목 검색...');
    fireEvent.change(searchInput, { target: { value: '김철수' } });

    expect(screen.getByText('김철수')).toBeDefined();
    expect(screen.getByText('계정 연동 질문')).toBeDefined();

    // 일치하지 않는 검색어 입력 시 안내 문구 확인
    fireEvent.change(searchInput, { target: { value: '존재하지않는회원' } });
    expect(screen.getByText('검색 조건과 일치하는 문의가 없습니다.')).toBeDefined();
  });

  it('reuses the same idempotency key after an uncertain reply acknowledgement', async () => {
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => 'cccccccc-cccc-4ccc-8ccc-cccccccccccc') });
    vi.mocked(adminSupportReply)
      .mockRejectedValueOnce(new Error('acknowledgement lost'))
      .mockResolvedValueOnce(undefined);

    render(<AdminSupportView
      initialThreads={mockThreads}
      initialMessages={mockMessages}
      selectedId="thread-1"
      initialStatus={null}
    />);
    fireEvent.change(screen.getByLabelText('관리자 답장'), { target: { value: 'Retry safely' } });
    const submit = screen.getByRole('button', { name: '답장' });
    fireEvent.submit(submit.closest('form')!);
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(toast.success).not.toHaveBeenCalledWith('관리자 답장이 회원에게 전송되었습니다.');
    fireEvent.submit(submit.closest('form')!);
    await waitFor(() => expect(adminSupportReply).toHaveBeenCalledTimes(2));
    const first = vi.mocked(adminSupportReply).mock.calls[0]![0];
    const second = vi.mocked(adminSupportReply).mock.calls[1]![0];
    expect(first.get('idempotencyKey')).toBe('cccccccc-cccc-4ccc-8ccc-cccccccccccc');
    expect(second.get('idempotencyKey')).toBe(first.get('idempotencyKey'));
    vi.unstubAllGlobals();
  });

  it('exposes accessible support search, polling state and attachment controls', () => {
    render(<AdminSupportView
      initialThreads={mockThreads}
      initialMessages={mockMessages}
      selectedId="thread-1"
      initialStatus={null}
    />);
    expect(screen.getByRole('textbox', { name: '문의 검색' })).toBeDefined();
    expect(screen.getByRole('button', { name: '실시간 5초 폴링 ON' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: '이미지 파일 첨부' })).toBeDefined();
  });

  it('inserts canned response when clicking quick preset buttons', () => {
    render(
      <AdminSupportView
        initialThreads={mockThreads}
        initialMessages={mockMessages}
        selectedId="thread-1"
        initialStatus={null}
      />
    );

    const cannedBtn = screen.getByText('🔍 [확인 중]');
    fireEvent.click(cannedBtn);

    const textarea = screen.getByLabelText('관리자 답장') as HTMLTextAreaElement;
    expect(textarea.value).toContain('제보해 주신 문의 내용을 꼼꼼히 확인하고 있습니다');
  });
});
