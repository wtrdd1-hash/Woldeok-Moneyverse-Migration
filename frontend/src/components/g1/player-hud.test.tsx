import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, screen, waitFor } from '@testing-library/react';
import { renderKo } from '@/testing/render-ko';

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));
vi.mock('@/components/use-mounted-viewer', () => ({ useMountedViewer: () => ({ signedIn: true }) }));

const { PlayerHud } = await import('./player-hud');

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

// Browser QA 2026-11-26 at 1280 px: the JA character label and the gold balance broke onto two
// lines ("999,8" / "96"). A balance never wraps; the label shrinks with an ellipsis instead.
describe('PlayerHud compact labels', () => {
  it('keeps the balance and the character label on one line', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ signedIn: true, currency: 'WLD', totalAvailableAmount: '999896' }))));
    renderKo(<PlayerHud />);
    const balance = await waitFor(() => screen.getByText('999,896'));
    expect(balance.className).toMatch(/\bwhitespace-nowrap\b/);
    const label = balance.closest('a')!.querySelector('span.font-semibold')!;
    expect(label.className).toMatch(/\btruncate\b/);
  });
});
