import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('public global header mobile touch target contract', () => {
  it('keeps the notice dismiss button at least 44 by 44 CSS pixels without clipping it inside a shorter bar', () => {
    const notice = readFileSync('src/components/notice-bar.tsx', 'utf8');
    expect(notice).toContain('className="grid size-11 place-items-center');
    expect(notice).toContain('flex min-h-11');
    expect(notice).not.toContain('flex h-8 min-h-8');
  });

  it('keeps the mobile menu trigger at least 44 by 44 at 320px', () => {
    const header = readFileSync('src/components/site-header.tsx', 'utf8');
    expect(header).toContain('className="size-11 rounded-[10px] lg:hidden');
    expect(header).not.toContain('className="size-10 min-[400px]:size-11');
  });
});
