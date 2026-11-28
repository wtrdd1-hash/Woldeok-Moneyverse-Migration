import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { useViewer } from './use-viewer';

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
});

// W03 QA: a signed-in member reaching a cached public page (/ after /login) raised React #418.
// The first client render read the cached viewer from localStorage while the server HTML was
// rendered without one, so hydration saw different markup. The first render must match the
// server; the cache is applied in the effect right after mount.
describe('useViewer hydration', () => {
  it('renders the server shape first and the cached viewer after mount', async () => {
    localStorage.setItem('moneyverse_cached_viewer', JSON.stringify({ signedIn: true, consentCurrent: true, adminRoles: [] }));
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    const seen: Array<boolean | null> = [];
    function Probe() {
      const viewer = useViewer();
      seen.push(viewer ? viewer.signedIn : null);
      return null;
    }
    render(<Probe />);
    expect(seen[0]).toBeNull();
    await waitFor(() => expect(seen.at(-1)).toBe(true));
  });
});
