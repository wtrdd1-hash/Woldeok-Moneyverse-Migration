import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdminStepUpStatus } from './admin-step-up-status';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

// The console header shows the server's own step-up state (recent password re-verification of this
// session), never a client-side countdown or a messenger "elevation" the server ignores.
describe('AdminStepUpStatus', () => {
  it('shows the re-verification link when the server says the session is not fresh', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ fresh: false, freshUntil: null }), { status: 200 })));
    const { container } = render(<AdminStepUpStatus />);
    await waitFor(() => expect(container.querySelector('a[href="/account/security"]')).not.toBeNull());
    expect(container.textContent).not.toMatch(/2FA|OTP|승격/);
  });

  it('shows the verified state with the server expiry when fresh', async () => {
    const until = new Date(Date.now() + 10 * 60_000).toISOString();
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ fresh: true, freshUntil: until }), { status: 200 })));
    render(<AdminStepUpStatus />);
    await screen.findByTestId('step-up-fresh');
  });

  it('claims nothing when the status cannot be read', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 503 })));
    const { container } = render(<AdminStepUpStatus />);
    await waitFor(() => expect(container.querySelector('[data-testid="step-up-fresh"]')).toBeNull());
    expect(container.querySelector('a[href="/account/security"]')).not.toBeNull();
  });
});
