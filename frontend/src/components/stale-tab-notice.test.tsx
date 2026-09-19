import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { releaseRefreshUrl, StaleTabNotice } from './stale-tab-notice';

const BUILD = 'build-one';

function answers(id: unknown, ok = true): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok, json: async () => ({ id }) }) as unknown as Response),
  );
}

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_BUILD_ID', BUILD);
  window.sessionStorage.clear();
  Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
});

afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('StaleTabNotice', () => {
  it('says nothing while the tab is serving the build it came from', async () => {
    answers(BUILD);
    render(<StaleTabNotice everyMs={10} />);
    document.dispatchEvent(new Event('visibilitychange'));
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('automatically navigates to a cache-busted URL when the release changes', async () => {
    answers('build-two');
    const navigate = vi.fn();
    render(<StaleTabNotice everyMs={10} navigate={navigate} />);
    document.dispatchEvent(new Event('visibilitychange'));
    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1));
    expect(navigate.mock.calls[0]?.[0]).toContain('__mv_release=build-two');
    expect(window.sessionStorage.getItem('moneyverse-release-refresh')).toBe('build-one->build-two');
  });

  it('does not enter an automatic reload loop when an intermediary cache keeps the old shell', async () => {
    answers('build-two');
    window.sessionStorage.setItem('moneyverse-release-refresh', 'build-one->build-two');
    const navigate = vi.fn();
    render(<StaleTabNotice everyMs={10} navigate={navigate} />);
    document.dispatchEvent(new Event('visibilitychange'));
    expect((await screen.findByRole('status')).textContent).toMatch(/캐시에 막혔습니다/);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('stays quiet when the answer cannot be read', async () => {
    answers(undefined, false);
    render(<StaleTabNotice everyMs={10} />);
    document.dispatchEvent(new Event('visibilitychange'));
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('checks the uncached version route', async () => {
    answers('build-two');
    render(<StaleTabNotice everyMs={10} navigate={vi.fn()} />);
    document.dispatchEvent(new Event('visibilitychange'));
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/version', { cache: 'no-store' }));
  });

  it('asks nothing while the tab is hidden', async () => {
    answers('build-two');
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    render(<StaleTabNotice everyMs={10} navigate={vi.fn()} />);
    document.dispatchEvent(new Event('visibilitychange'));
    await new Promise((resolve) => setTimeout(resolve, 40));
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('releaseRefreshUrl', () => {
  it('preserves path, query and hash while adding the release cache buster', () => {
    const refreshed = releaseRefreshUrl('https://example.test/work?tab=active#now', 'sha-2');
    expect(refreshed).toBe('https://example.test/work?tab=active&__mv_release=sha-2#now');
  });
});
