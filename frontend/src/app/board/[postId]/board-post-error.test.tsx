import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import BoardPostError from './error';

afterEach(cleanup);

describe('public board outage recovery', () => {
  it('explains unavailability without claiming the discussion was deleted and offers keyboard retry', () => {
    const reset = vi.fn();
    render(<BoardPostError error={new Error('private upstream detail')} reset={reset} />);
    const heading = screen.getByRole('heading', { name: '게시글을 지금 불러올 수 없어요.' });
    expect(document.activeElement).toBe(heading);
    expect(document.querySelector('meta[name="robots"][content="noindex,nofollow"]')).not.toBeNull();
    expect(screen.getByRole('alert').textContent).toContain('일시적인 연결 문제');
    expect(screen.queryByText('private upstream detail')).toBeNull();
    expect(screen.getByRole('link', { name: '다시 시도' }).getAttribute('href')).toBe('?retry=1');
    expect(screen.getByRole('link', { name: '게시판 목록으로' }).getAttribute('href')).toBe('/board');
  });
});
