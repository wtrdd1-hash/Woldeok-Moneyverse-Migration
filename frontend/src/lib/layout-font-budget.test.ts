import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const layoutSource = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const globalCss = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');

/** Build-time Google CSS can change format without a lockfile update. */
describe('offline deterministic layout fonts', () => {
  it('does not invoke next/font/google in a clean release build', () => {
    expect(layoutSource).not.toContain("from 'next/font/google'");
  });

  it.each([
    ['@fontsource/nanum-myeongjo/700.css', '--font-myeongjo', 'Nanum Myeongjo'],
    ['@fontsource-variable/noto-sans-kr/wght.css', '--font-noto-kr', 'Noto Sans KR Variable'],
    ['@fontsource/ibm-plex-mono/400.css', '--font-plex-mono', 'IBM Plex Mono'],
  ])('loads %s locally and retains %s typography variable', (stylesheet, variable, family) => {
    expect(layoutSource).toContain(`import '${stylesheet}';`);
    expect(globalCss).toContain(`${variable}: '${family}';`);
  });

  it('does not eagerly preload CJK font shards', () => {
    expect(layoutSource).not.toContain('rel="preload"');
    expect(layoutSource).not.toContain('preload: true');
  });
});
