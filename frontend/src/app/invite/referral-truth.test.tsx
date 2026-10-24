// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { ReferralSystem } from '@/components/viral/referral-system';
import InviteLandingPage, { generateMetadata } from './[code]/page';

const referralSource = readFileSync('src/components/viral/referral-system.tsx', 'utf8');
const inviteSource = readFileSync('src/app/invite/[code]/page.tsx', 'utf8');

describe('referral truth and signup navigation', () => {
  it('does not fabricate an invite code, invite counts, WLD credits, or a bonus promise', () => {
    const html = renderToStaticMarkup(createElement(ReferralSystem));
    expect(html).not.toMatch(/INV-WLD999|30,000,000|1,000만 WLD|즉시 지급|무제한 리퍼럴|초대한 친구/);
    expect(referralSource).not.toMatch(/invitedCount\s*=\s*3|totalEarnedWld\s*=\s*30000000/);
    expect(html).toContain('/register');
    expect(html).toContain('서비스 소개');
  });

  it('never verifies arbitrary invite codes or claims an unimplemented WLD reward', async () => {
    const html = renderToStaticMarkup(await InviteLandingPage());
    expect(html).not.toMatch(/인증 완료|1,000만 WLD|즉시 지급 확정|100% 무료|피로회복제 5개/);
    expect(html).toContain('확인되지');
    expect(html).toContain('href="/register"');
    expect(html).toContain('href="/login"');
    expect(html).not.toContain('/auth/login?invite=');
  });

  it('keeps unverified referral URLs out of search and does not echo user input into metadata', async () => {
    const metadata = await generateMetadata();
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(JSON.stringify(metadata)).not.toContain('UNTRUSTED-PAYLOAD');
    expect(inviteSource).not.toContain('https://easy-scraping.com/invite/${code}');
  });
});
