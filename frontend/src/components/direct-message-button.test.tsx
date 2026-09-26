import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { DirectMessageButton } from './direct-message-button';

describe('DirectMessageButton', () => {
  afterEach(() => {
    cleanup();
  });

  it('본인 글/댓글인 경우(mine=true) 버튼을 렌더링하지 않는다', () => {
    const { container } = render(
      <DirectMessageButton
        authorName="나자신"
        targetUserId="user-123"
        mine={true}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('타인 글/댓글이고 targetUserId가 주어진 경우 올바른 /chat?peer= 링크를 렌더링한다', () => {
    render(
      <DirectMessageButton
        authorName="모험가A"
        targetUserId="user-456"
        mine={false}
      />
    );

    const link = screen.getByTestId('dm-button');
    expect(link).toBeDefined();
    expect(link.getAttribute('href')).toBe('/chat?peer=user-456');
    expect(link.getAttribute('aria-label')).toBe('모험가A님에게 1:1 쪽지 보내기');
    expect(screen.getByText('쪽지')).toBeDefined();
  });

  it('targetUserId가 없는 경우 기본 /chat 링크를 생성한다', () => {
    render(
      <DirectMessageButton
        authorName="익명유저"
        targetUserId={null}
        mine={false}
      />
    );

    const link = screen.getByTestId('dm-button');
    expect(link.getAttribute('href')).toBe('/chat');
    expect(link.getAttribute('aria-label')).toBe('익명유저님에게 1:1 쪽지 보내기');
  });

  it('size="sm" 적용 시 컴팩트 스타일 클래스가 적용된다', () => {
    render(
      <DirectMessageButton
        authorName="댓글작성자"
        targetUserId="user-789"
        mine={false}
        size="sm"
      />
    );

    const link = screen.getByTestId('dm-button');
    expect(link.className).toContain('text-[11px]');
  });
});
