import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('@/lib/viewer', () => ({
  currentViewer: async () => ({ signedIn: false, consentCurrent: false, adminRoles: [] }),
}));

import SearchPage, { metadata } from './page';

describe('public global search SSR', () => {
  it('renders canonical glossary results with accessible links and responsive layout', async () => {
    const html = renderToStaticMarkup(await SearchPage({ searchParams: Promise.resolve({ q: '주가수익비율' }) }));
    expect(html).toContain('공개 금융 용어사전');
    expect(html).toContain('href="/guide/glossary/per"');
    expect(html).toContain('PER (주가수익비율) 용어 설명 보기');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('sm:grid-cols-2');
    expect(html).not.toContain('href="/admin/');
    expect(html).not.toContain('href="/wallet"');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('treats repeated query parameters as invalid rather than leaking a server error', async () => {
    const html = renderToStaticMarkup(await SearchPage({ searchParams: Promise.resolve({ q: ['PER', 'admin'] }) }));
    expect(html).toContain('찾을 기능을 입력해 주세요.');
    expect(html).not.toContain('공개 금융 용어사전');
  });

  it('does not pretend that a blank query has glossary matches', async () => {
    const html = renderToStaticMarkup(await SearchPage({ searchParams: Promise.resolve({ q: '' }) }));
    expect(html).toContain('찾을 기능을 입력해 주세요.');
    expect(html).not.toContain('공개 금융 용어사전');
  });
});
