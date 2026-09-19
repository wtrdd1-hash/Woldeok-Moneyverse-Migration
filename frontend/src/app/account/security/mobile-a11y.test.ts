import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(join(process.cwd(), 'src/app/account/security/page.tsx'), 'utf8');

describe('account security mobile accessibility', () => {
  it('keeps every security action at least 44px tall', () => {
    expect(source).toContain('<Button type="submit" variant="outline" className="min-h-11 w-full sm:w-auto">이 세션 종료</Button>');
    expect(source).toContain('variant="destructive" disabled={otherCount === 0} className="min-h-11 w-full sm:w-auto"');
    expect(source).toContain('<Button type="submit" variant="outline" className="min-h-11 w-full sm:w-auto">');
    expect(source).toContain('<Button asChild variant="ghost" className="min-h-11 w-fit">');
  });

  it('shows privacy-safe device and recent-activity context for each session', () => {
    expect(source).toContain('{session.deviceLabel}');
    expect(source).toContain('최근 활동 {formatMoment(session.lastSeenAt)}');
    expect(source).not.toContain('userAgent');
  });

  it('keeps destructive and provider actions full-width on narrow screens', () => {
    expect(source).toContain('<form action={terminateOtherSessions} className="w-full sm:w-auto">');
    expect(source).toContain('<form action={terminateAllSessions} className="w-full sm:w-auto">');
    expect(source).toContain('key={identity.provider} className="w-full sm:w-auto"');
  });

  it('describes both local-password and OAuth reauthentication accurately', () => {
    expect(source).toContain('연결된 이메일·비밀번호 또는 OAuth 로그인 수단으로 확인할 수 있습니다.');
    expect(source).not.toContain('최근 OAuth 본인 확인 후에만 허용됩니다.');
  });

  it('retains the member-only and noindex security boundary', () => {
    expect(source).toContain('await requireMember();');
    expect(source).toContain('robots: { index: false, follow: false }');
  });
});
