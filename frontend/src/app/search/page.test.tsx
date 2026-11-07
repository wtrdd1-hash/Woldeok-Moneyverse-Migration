import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const viewer = vi.hoisted(() => vi.fn());
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown: viewer }));

import SearchPage from './page';

async function htmlFor(q: unknown) {
  const tree = await SearchPage({ searchParams: Promise.resolve({ q }) });
  return renderToStaticMarkup(tree);
}

describe('global search SSR source and query integrity', () => {
  beforeEach(() => viewer.mockReset());

  it('handles duplicated q without crashing or echoing untrusted values', async () => {
    viewer.mockResolvedValue({ signedIn: false, consentCurrent: false, adminRoles: [] });
    const html = await htmlFor(['wallet', 'admin']);
    expect(html).toContain('role="alert"');
    expect(html).toContain('검색어');
    expect(html).not.toContain('wallet,admin');
    expect(html).not.toContain('href="/admin');
  });

  it('does not turn an unavailable auth API into a false empty member search', async () => {
    viewer.mockResolvedValue(null);
    const html = await htmlFor('지갑');
    expect(html).toContain('role="alert"');
    expect(html).toContain('로그인 상태를 확인할 수 없습니다');
    expect(html).not.toContain('검색 결과가 없습니다');
    expect(html).not.toContain('href="/wallet"');
  });

  it('keeps verified public guide search available during an authentication outage', async () => {
    viewer.mockResolvedValue(null);
    const html = await htmlFor('가이드');
    expect(html).toContain('로그인 상태를 확인할 수 없습니다');
    expect(html).toContain('href="/guide"');
    expect(html).not.toContain('href="/wallet"');
  });

  it('does not claim bank or wallet is public for guests', async () => {
    viewer.mockResolvedValue({ signedIn: false, consentCurrent: false, adminRoles: [] });
    const html = await htmlFor('지갑');
    expect(html).not.toContain('href="/wallet"');
    expect(html).toContain('검색 결과가 없습니다');
  });

  it('shows authenticated wallet navigation only when verified by the backend viewer contract', async () => {
    viewer.mockResolvedValue({ signedIn: true, consentCurrent: true, adminRoles: [] });
    const html = await htmlFor('지갑');
    expect(html).toContain('href="/wallet"');
    expect(html).toContain('회원');
  });

  it('fails closed on a malformed viewer response rather than rendering administrator links', async () => {
    viewer.mockResolvedValue({ signedIn: true, consentCurrent: true, adminRoles: 'admin' });
    const html = await htmlFor('admin');
    expect(html).toContain('role="alert"');
    expect(html).not.toContain('href="/admin');
  });
});
