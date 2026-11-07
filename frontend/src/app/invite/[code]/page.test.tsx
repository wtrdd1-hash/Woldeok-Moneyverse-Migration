import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import InviteLandingPage, { generateMetadata } from './page';

const params = Promise.resolve({ code: 'SOME-UNVERIFIED-CODE' });

describe('unverified invitation landing — fail closed', () => {
  it('does not index an unverified invitation or promise an unearned payout in metadata', async () => {
    const metadata = await generateMetadata({ params });
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(JSON.stringify(metadata)).not.toMatch(/1,000만|10,000,000|즉시 수령|100% 무료|인증 완료|스타터 패키지/);
    expect(JSON.stringify(metadata)).not.toContain('SOME-UNVERIFIED-CODE');
  });

  it('renders an accessible unverified state and only real registration and login links', async () => {
    const page = await InviteLandingPage({ params });
    const html = renderToStaticMarkup(createElement('main', null, page));
    expect(html).toContain('초대 코드의 유효성을 확인할 수 없습니다');
    expect(html).toContain('role="status"');
    expect(html).toContain('href="/register"');
    expect(html).toContain('href="/login"');
    expect(html).not.toContain('href="/auth/login');
    expect(html).not.toContain('SOME-UNVERIFIED-CODE');
    expect(html).not.toMatch(/10,000,000|1,000만|5개 \(즉시 충전\)|인증 완료|즉시 지급 확정/);
  });
});
