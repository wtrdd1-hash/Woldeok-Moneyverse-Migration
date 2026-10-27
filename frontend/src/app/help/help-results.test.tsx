// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HelpResults } from './help-results';
import type { HelpSearchState } from './actions';

function verified(deadline: string): HelpSearchState {
  return { status: 'results', locale: 'en', articles: [{
    article_id: 'a1', locale: 'en', slug: 'account-login', title: 'Account login',
    summary: 'Verified guidance', category: 'account', reviewed_until: deadline,
  }] };
}

describe('open verified help result expiry truth', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-27T07:00:00.000Z'));
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('removes verified results automatically at their exact review deadline', () => {
    render(<HelpResults state={verified('2026-10-27T07:00:01.000Z')} locale="en" />);
    expect(screen.getByRole('link', { name: 'Account login' })).toBeTruthy();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.queryByRole('link', { name: 'Account login' })).toBeNull();
    expect(screen.getByText('No currently verified results.')).toBeTruthy();
  });

  it('rechecks when a suspended tab becomes visible after its evidence expired', () => {
    render(<HelpResults state={verified('2026-10-27T07:00:01.000Z')} locale="en" />);
    expect(screen.getByRole('link', { name: 'Account login' })).toBeTruthy();
    act(() => {
      vi.setSystemTime(new Date('2026-10-27T07:10:00.000Z'));
      fireEvent(document, new Event('visibilitychange'));
    });
    expect(screen.queryByRole('link', { name: 'Account login' })).toBeNull();
  });
});
