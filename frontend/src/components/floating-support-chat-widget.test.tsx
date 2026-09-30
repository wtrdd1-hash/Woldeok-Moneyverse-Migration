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

describe('FloatingSupportChatWidget', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('플로팅 트리거 버블 버튼이 정상 렌더링된다', () => {
    render(<FloatingSupportChatWidget />);
    const trigger = screen.getByLabelText('관리자 1:1 문의창 열기/닫기');
    expect(trigger).toBeDefined();
    expect(screen.getByText('관리자 1:1 실시간 문의')).toBeDefined();
  });

  it('버블 클릭 시 플로팅 대화창 팝오버가 열리고 닫힌다', async () => {
    // Mock global fetch for threads
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/app-api/v1/support/threads')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ threads: [] }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(<FloatingSupportChatWidget />);
    const trigger = screen.getByLabelText('관리자 1:1 문의창 열기/닫기');

    // Open
    await act(async () => {
      fireEvent.click(trigger);
    });
    expect(screen.getByText('월덕 고객센터 · 1:1 문의')).toBeDefined();
    expect(screen.getByText('운영팀 실시간 상담 가동')).toBeDefined();
    expect(screen.getByText('새 1:1 문의 작성하기')).toBeDefined();

    // Close via close button in header
    const closeBtn = screen.getByLabelText('닫기');
    await act(async () => {
      fireEvent.click(closeBtn);
    });
    expect(screen.queryByText('월덕 고객센터 · 1:1 문의')).toBeNull();
  });

  it('새 문의 작성 폼 진입 시 카테고리 프리셋 칩 클릭이 정상 동작한다', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ threads: [] }),
    });

    render(<FloatingSupportChatWidget />);
    const trigger = screen.getByLabelText('관리자 1:1 문의창 열기/닫기');
    await act(async () => {
      fireEvent.click(trigger);
    });

    const newBtn = screen.getByText('새 1:1 문의 작성하기');
    await act(async () => {
      fireEvent.click(newBtn);
    });

    expect(screen.getByText('새 1:1 문의 접수')).toBeDefined();
    expect(screen.getByText('빠른 카테고리 선택')).toBeDefined();

    // Click preset chip
    const bugChip = screen.getByText('버그 제보');
    await act(async () => {
      fireEvent.click(bugChip);
    });

    const subjectInput = screen.getByLabelText('문의 제목') as HTMLInputElement;
    expect(subjectInput.value).toContain('[버그 제보]');
  });

  it('효과음 Mute/Unmute 토글 버튼이 정상 동작한다', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ threads: [] }),
    });

    render(<FloatingSupportChatWidget />);
    const trigger = screen.getByLabelText('관리자 1:1 문의창 열기/닫기');
    await act(async () => {
      fireEvent.click(trigger);
    });

    const muteBtn = screen.getByLabelText('Mute sound');
    expect(muteBtn).toBeDefined();

    // Click to mute
    await act(async () => {
      fireEvent.click(muteBtn);
    });
    expect(screen.getByLabelText('Unmute sound')).toBeDefined();

    // Click to unmute
    const unmuteBtn = screen.getByLabelText('Unmute sound');
    await act(async () => {
      fireEvent.click(unmuteBtn);
    });
    expect(screen.getByLabelText('Mute sound')).toBeDefined();
  });
});

