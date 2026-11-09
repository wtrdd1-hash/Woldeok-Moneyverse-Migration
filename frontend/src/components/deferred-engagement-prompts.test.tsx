// @vitest-environment jsdom
import React from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const registrations = vi.hoisted(() => [] as Array<{ ssr?: boolean }>);
vi.mock('next/dynamic', () => ({
  default: (_loader: unknown, options: { ssr: boolean }) => {
    const index = registrations.push(options) - 1;
    return function OptionalPromptStub() {
      return <span data-testid={index === 0 ? 'watchlist' : 'first-trade'} />;
    };
  },
}));

import { DeferredEngagementPrompts } from './deferred-engagement-prompts';

describe('post-hydration optional engagement', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    delete (window as { requestIdleCallback?: unknown }).requestIdleCallback;
    delete (window as { cancelIdleCallback?: unknown }).cancelIdleCallback;
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('places both optional bundles outside of the server-rendered critical path', () => {
    expect(registrations).toHaveLength(2);
    expect(registrations.every((item) => item.ssr === false)).toBe(true);
  });

  it('does not render either prompt before fallback idle time and mounts both afterward', () => {
    render(<DeferredEngagementPrompts />);
    expect(screen.queryByTestId('watchlist')).toBeNull();
    expect(screen.queryByTestId('first-trade')).toBeNull();
    act(() => vi.advanceTimersByTime(1199));
    expect(screen.queryByTestId('watchlist')).toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByTestId('watchlist')).toBeTruthy();
    expect(screen.getByTestId('first-trade')).toBeTruthy();
  });

  it('uses native requestIdleCallback and cancels it on unmount', () => {
    let pending: (() => void) | undefined;
    const cancel = vi.fn();
    Object.assign(window, {
      requestIdleCallback: vi.fn((fn: () => void) => {
        pending = fn;
        return 42;
      }),
      cancelIdleCallback: cancel,
    });
    const view = render(<DeferredEngagementPrompts />);
    expect(window.requestIdleCallback).toHaveBeenCalledWith(expect.any(Function), { timeout: 2000 });
    expect(screen.queryByTestId('watchlist')).toBeNull();
    act(() => pending?.());
    expect(screen.getByTestId('watchlist')).toBeTruthy();
    view.unmount();
    expect(cancel).toHaveBeenCalledWith(42);
  });

  it('cleans up fallback timer without mounting prompts when unmounted early', () => {
    const view = render(<DeferredEngagementPrompts />);
    view.unmount();
    act(() => vi.runAllTimers());
    expect(screen.queryByTestId('watchlist')).toBeNull();
  });
});
