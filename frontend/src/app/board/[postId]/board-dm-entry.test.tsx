import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { DirectMessageButton } from '@/components/direct-message-button';

describe('Board Post and Comment Direct Message Entry Point', () => {
  afterEach(() => {
    cleanup();
  });

  it('게시글 작성자가 타인인 경우 헤더에 쪽지 버튼이 올바르게 렌더링된다', () => {
    render(
      <header>
        <h1>테스트 게시글 제목</h1>
        <div className="flex items-center gap-1.5">
          <span>작성자A</span>
          <DirectMessageButton
            authorName="작성자A"
            targetUserId="author-uuid-1"
            mine={false}
            size="sm"
          />
        </div>
      </header>
    );

    const btn = screen.getByTestId('dm-button');
    expect(btn).toBeDefined();
    expect(btn.getAttribute('href')).toBe('/chat?peer=author-uuid-1');
    expect(btn.getAttribute('aria-label')).toBe('작성자A님에게 1:1 쪽지 보내기');
  });

  it('게시글 작성자가 본인인 경우(mine=true) 쪽지 버튼이 숨겨진다', () => {
    const { container } = render(
      <header>
        <h1>내가 쓴 게시글</h1>
        <div className="flex items-center gap-1.5">
          <span>나자신</span>
          <DirectMessageButton
            authorName="나자신"
            targetUserId="author-uuid-mine"
            mine={true}
            size="sm"
          />
        </div>
      </header>
    );

    expect(container.querySelector('[data-testid="dm-button"]')).toBeNull();
  });

  it('댓글 작성자가 타인인 경우 댓글 행에 쪽지 버튼이 올바르게 렌더링된다', () => {
    render(
      <div className="comment-row">
        <b>댓글작성자B</b>
        <DirectMessageButton
          authorName="댓글작성자B"
          targetUserId="commenter-uuid-2"
          mine={false}
          size="sm"
        />
        <p>유용한 정보 감사합니다!</p>
      </div>
    );

    const btn = screen.getByTestId('dm-button');
    expect(btn).toBeDefined();
    expect(btn.getAttribute('href')).toBe('/chat?peer=commenter-uuid-2');
    expect(btn.getAttribute('aria-label')).toBe('댓글작성자B님에게 1:1 쪽지 보내기');
  });
});
