import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StaleTabNotice } from './stale-tab-notice';

/**
 * The notice exists for one failure: a tab open across a deploy, whose
 * buttons answer 404 and say nothing. It must appear when the build moved on
 * and stay out of the way in every other case — a banner that cries wolf on a
 * dropped request would teach the reader to ignore the one that matters.
 */
const BUILD = 'build-one';

function answers(id: unknown, ok = true): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok, json: async () => ({ id }) }) as unknown as Response),
  );
}

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_BUILD_ID', BUILD);
  Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

const notice = /새 버전이 배포됐어요/;

describe('StaleTabNotice', () => {
  it('says nothing while the tab is serving the build it came from', async () => {
    answers(BUILD);
    render(<StaleTabNotice everyMs={10} />);
    document.dispatchEvent(new Event('visibilitychange'));
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.queryByText(notice)).toBeNull();
  });

  it('tells the reader when the site has moved on without them', async () => {
    answers('build-two');
    render(<StaleTabNotice everyMs={10} />);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(await screen.findByText(notice)).toBeTruthy();
    expect(screen.getByRole('button', { name: /새로고침/ })).toBeTruthy();
  });

  it('stays quiet when the answer cannot be read, which is not evidence of anything', async () => {
    answers(undefined, false);
    render(<StaleTabNotice everyMs={10} />);
    document.dispatchEvent(new Event('visibilitychange'));
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.queryByText(notice)).toBeNull();
  });

  it('asks the route that exists, which is not the one .gitignore ate', async () => {
    answers('build-two');
    render(<StaleTabNotice everyMs={10} />);
    document.dispatchEvent(new Event('visibilitychange'));
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/version', { cache: 'no-store' }));
  });

  it('asks nothing at all while the tab is hidden', async () => {
    answers('build-two');
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    render(<StaleTabNotice everyMs={10} />);
    document.dispatchEvent(new Event('visibilitychange'));
    await new Promise((resolve) => setTimeout(resolve, 40));
    expect(fetch).not.toHaveBeenCalled();
  });
});
