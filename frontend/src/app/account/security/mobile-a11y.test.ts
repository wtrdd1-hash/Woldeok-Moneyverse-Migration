import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(join(process.cwd(), 'src/app/account/security/page.tsx'), 'utf8');

describe('account security mobile accessibility', () => {
  it('keeps every security action at least 44px tall', () => {
    expect(source).toContain('<Button type="submit" variant="outline" className="min-h-11">이 세션 종료</Button>');
    expect(source).toContain('variant="destructive" disabled={otherCount === 0} className="min-h-11"');
    expect(source).toContain('<Button type="submit" variant="outline" className="min-h-11">');
    expect(source).toContain('<Button asChild variant="ghost" className="min-h-11 w-fit">');
  });

  it('retains the member-only and noindex security boundary', () => {
    expect(source).toContain('await requireMember();');
    expect(source).toContain('robots: { index: false, follow: false }');
  });
});
