// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HelpArticleLive } from './help-article-live';

describe('open help article expiry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-27T07:00:00.000Z'));
  });
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  it('removes an open article body and source when its verified review expires', () => {
    render(<HelpArticleLive locale="en" sourceHref="https://example.org/source"
      article={{ title: 'Verified article', summary: 'Evidence', body_plain: 'Old instruction',
        reviewed_until: '2026-10-27T07:00:01.000Z' }} />);
    expect(screen.getByText('Old instruction')).toBeTruthy();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByText('Old instruction')).toBeNull();
    expect(screen.queryByRole('link', { name: 'View original' })).toBeNull();
    expect(screen.getByRole('status').textContent).toMatch(/expired/);
  });
});
