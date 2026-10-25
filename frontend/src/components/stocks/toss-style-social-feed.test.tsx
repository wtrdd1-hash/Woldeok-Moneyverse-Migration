import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TossStyleSocialFeed } from './toss-style-social-feed';

const serverPost = {
  postId: '1f9f725a-b4f2-4eb1-987c-7e6c8e0a9c21',
  title: 'WDX 실적 발표 관련 질문',
  authorName: '실제게시자',
  createdAt: '2026-10-25T00:00:00.000Z',
  commentCount: 3,
  stock: {
    symbol: 'WDX',
    name: '월덱 게임즈',
    category: 'question',
    stance: 'neutral',
    positionDisclosure: 'holder',
  },
} as const;

describe('server-authoritative stock community feed', () => {
  it('renders only PostgreSQL-backed posts with real discussion links and no fabricated returns or holder certification', () => {
    render(<TossStyleSocialFeed posts={[serverPost]} selectedStock={null} loadFailed={false} />);
    expect(screen.getByText('WDX 실적 발표 관련 질문')).toBeDefined();
    expect(screen.getByText('실제게시자')).toBeDefined();
    expect(screen.getByRole('link', { name: /WDX 실적 발표 관련 질문/ }).getAttribute('href'))
      .toBe('/board/1f9f725a-b4f2-4eb1-987c-7e6c8e0a9c21');
    expect(screen.getByText(/작성자 자기신고/)).toBeDefined();
    expect(screen.queryByText('+48.5%')).toBeNull();
    expect(screen.queryByText('여의도덕이')).toBeNull();
    expect(screen.queryByText('주주인증')).toBeNull();
    expect(screen.queryByRole('button', { name: /응원해요/ })).toBeNull();
  });

  it('shows a truthful empty state and sends posting to the existing server-authorized board form', () => {
    render(<TossStyleSocialFeed posts={[]} selectedStock="WDX" loadFailed={false} />);
    expect(screen.getByText(/아직 등록된 종목 토론 글이 없어요/)).toBeDefined();
    expect(screen.getByRole('link', { name: /토론 글 작성/ }).getAttribute('href'))
      .toBe('/board?stock=WDX');
    expect(screen.getByRole('textbox', { name: '종목코드' }).getAttribute('maxLength')).toBe('16');
    expect(screen.queryByText('40만 WLD')).toBeNull();
  });

  it('distinguishes an API failure from an empty discussion list', () => {
    render(<TossStyleSocialFeed posts={[]} selectedStock={null} loadFailed />);
    expect(screen.getByRole('alert').textContent).toContain('불러오지 못했어요');
    expect(screen.queryByText(/아직 등록된 종목 토론 글이 없어요/)).toBeNull();
  });
});
