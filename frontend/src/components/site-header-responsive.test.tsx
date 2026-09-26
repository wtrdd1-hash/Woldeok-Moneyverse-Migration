// @vitest-environment node
import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('SiteHeader Responsive Clipping Invariant', () => {
  const headerPath = path.resolve(__dirname, 'site-header.tsx');
  const source = fs.readFileSync(headerPath, 'utf8');

  it('enforces hidden xl:inline-block for account button text to prevent clipping in 1024-1279px range', () => {
    // [내 계정] 텍스트가 1280px 미만(1024~1279px)에서 숨겨져 아이콘으로 핏팅되는지 검증
    expect(source).toContain('hidden xl:inline-block text-xs font-bold text-muted-foreground');
  });

  it('enforces hidden xl:inline for wallet button text to prevent clipping in 1024-1279px range', () => {
    // [내 지갑] 텍스트가 1280px 미만에서 숨겨져 아이콘으로 핏팅되는지 검증
    expect(source).toContain('hidden xl:inline');
  });

  it('applies compact padding and gaps on lg viewport for navigation items', () => {
    // lg 뷰포트에서 nav gap이 gap-1 xl:gap-2 lg:flex로 유지되면서 패딩이 콤팩트하게 적용되는지 검증
    expect(source).toContain('hidden items-center gap-4 xl:gap-5 lg:flex');
    expect(source).toContain('px-2.5 xl:px-3 py-1.5 xl:py-2 text-xs xl:text-sm');
  });

  it('retains server clock pill on 2xl and desktop while hiding on compact views', () => {
    expect(source).toContain('hidden md:inline-flex lg:hidden 2xl:inline-flex');
  });
});
