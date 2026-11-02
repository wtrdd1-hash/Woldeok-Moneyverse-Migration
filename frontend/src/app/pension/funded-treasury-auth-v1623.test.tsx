// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { FundedTreasuryPensionPanel } from './funded-treasury-pension-panel';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('v1623 funded pension status semantics', () => {
  it.each([
    [401, /로그인 후.*국민연금/],
    [403, /국민연금.*접근 권한/],
    [503, /원장 증빙 미확인/],
  ])('renders correct financial access warning for HTTP %s', async (httpStatus, message) => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ code: 'SAFE' }), { status: httpStatus })));
    render(<FundedTreasuryPensionPanel />);
    expect(await screen.findByRole('status', { name: '' })).toBeDefined();
    expect((await screen.findByText(message)).textContent).toMatch(message);
    expect(screen.queryByRole('button', { name: '증빙 납입' })).toBeNull();
  });
});
