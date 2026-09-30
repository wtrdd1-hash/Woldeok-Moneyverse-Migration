import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import { FloatingSupportChatWidget } from './floating-support-chat-widget';

// Mock useViewer and useLocale
vi.mock('@/lib/use-viewer', () => ({
  useViewer: vi.fn(() => ({ signedIn: true, userId: 'user-test-123' })),
}));

vi.mock('@/components/locale-provider', () => ({
  useLocale: vi.fn(() => ({ locale: 'ko' })),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('FloatingSupportChatWidget (통합 고객지원 & 1:1 쪽지 허브)', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('플로팅 트리거 버블 버튼이 정상 렌더링된다', () => {
    render(<FloatingSupportChatWidget />);
    const trigger = screen.getByLabelText('1:1 채팅 및 고객센터 열기/닫기');
    expect(trigger).toBeDefined();
    expect(screen.getByText('1:1 채팅 · 고객지원')).toBeDefined();
  });

  it('버블 클릭 시 플로팅 대화창이 열리고 고객센터/1:1쪽지 듀얼 탭이 노출된다', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/app-api/v1/support/threads')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ threads: [] }),
        });
      }
      if (url.includes('/app-api/v1/chat/conversations')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ conversations: [] }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(<FloatingSupportChatWidget />);
    const trigger = screen.getByLabelText('1:1 채팅 및 고객센터 열기/닫기');

    // Open
    await act(async () => {
      fireEvent.click(trigger);
    });

    // Verify dual tabs
    expect(screen.getByText('고객센터')).toBeDefined();
    expect(screen.getByText('1:1 쪽지')).toBeDefined();
    expect(screen.getByText('새 1:1 문의 작성하기')).toBeDefined();

    // Close
    const closeBtn = screen.getByLabelText('닫기');
    await act(async () => {
      fireEvent.click(closeBtn);
    });
    expect(screen.queryByText('고객센터 · 1:1 문의')).toBeNull();
  });

  it('1:1 쪽지 탭으로 전환 시 쪽지 대화방 목록이 렌더링된다', async () => {
    const mockConversations = [
      {
        conversation_id: 'conv-123',
        state: 'active',
        latest_sequence: '5',
        last_message_at: '2026-10-01T00:00:00Z',
        created_at: '2026-10-01T00:00:00Z',
        peer_user_id: 'peer-456',
        peer_display_name: '홍길동',
        peer_avatar_key: null,
        last_read_sequence: '3',
        unread_count: '2',
        muted: false,
        archived: false,
        last_message_body: '안녕하세요! 주식 거래 질문있습니다.',
      },
    ];

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/app-api/v1/chat/conversations')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ conversations: mockConversations }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ threads: [] }),
      });
    });

    render(<FloatingSupportChatWidget />);
    const trigger = screen.getByLabelText('1:1 채팅 및 고객센터 열기/닫기');
    await act(async () => {
      fireEvent.click(trigger);
    });

    // Switch to direct chat tab
    const directTabBtn = screen.getByText('1:1 쪽지');
    await act(async () => {
      fireEvent.click(directTabBtn);
    });

    expect(screen.getByText('홍길동')).toBeDefined();
    expect(screen.getByText('안녕하세요! 주식 거래 질문있습니다.')).toBeDefined();
    expect(screen.getByPlaceholderText('대화 상대 또는 메시지 검색')).toBeDefined();
  });

  it('1:1 쪽지 대화방 진입 시 메시지 목록 및 입력창이 렌더링된다', async () => {
    const mockConversations = [
      {
        conversation_id: 'conv-123',
        state: 'active',
        latest_sequence: '5',
        last_message_at: '2026-10-01T00:00:00Z',
        created_at: '2026-10-01T00:00:00Z',
        peer_user_id: 'peer-456',
        peer_display_name: '이순신',
        peer_avatar_key: null,
        last_read_sequence: '5',
        unread_count: '0',
        muted: false,
        archived: false,
        last_message_body: '반갑습니다!',
      },
    ];

    const mockMessages = [
      {
        id: 'msg-1',
        conversation_id: 'conv-123',
        sender_id: 'peer-456',
        sequence: '1',
        body: '반갑습니다!',
        created_at: '2026-10-01T00:00:00Z',
        is_mine: false,
      },
    ];

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/messages')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ messages: mockMessages }),
        });
      }
      if (url.includes('/app-api/v1/chat/conversations')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ conversations: mockConversations }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ threads: [] }),
      });
    });

    render(<FloatingSupportChatWidget />);
    const trigger = screen.getByLabelText('1:1 채팅 및 고객센터 열기/닫기');
    await act(async () => {
      fireEvent.click(trigger);
    });

    const directTabBtn = screen.getByText('1:1 쪽지');
    await act(async () => {
      fireEvent.click(directTabBtn);
    });

    // Click conversation
    const convBtn = screen.getByText('이순신');
    await act(async () => {
      fireEvent.click(convBtn);
    });

    expect(screen.getByPlaceholderText('쪽지 내용 입력… (Enter 전송)')).toBeDefined();
    expect(screen.getByLabelText('쪽지 전송')).toBeDefined();
  });

  it('음소거 Mute/Unmute 토글 버튼이 정상 동작한다', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ threads: [], conversations: [] }),
    });

    render(<FloatingSupportChatWidget />);
    const trigger = screen.getByLabelText('1:1 채팅 및 고객센터 열기/닫기');
    await act(async () => {
      fireEvent.click(trigger);
    });

    const muteBtn = screen.getByLabelText('Mute sound');
    expect(muteBtn).toBeDefined();

    await act(async () => {
      fireEvent.click(muteBtn);
    });
    expect(screen.getByLabelText('Unmute sound')).toBeDefined();

    const unmuteBtn = screen.getByLabelText('Unmute sound');
    await act(async () => {
      fireEvent.click(unmuteBtn);
    });
    expect(screen.getByLabelText('Mute sound')).toBeDefined();
  });
});
