import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * 2026-11-26: the passbook primitive was first named .mv-page, a class 88 page wrappers already
 * used, which painted every one of those pages cream behind white text. Passbook primitives
 * may appear only inside components/passbook and the passbook surfaces that opt in.
 */
const root = join(__dirname, '..', '..');
const OPT_IN = ['components/passbook/', 'app/wallet/activity/page.tsx'];

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return files(p);
    return /\.tsx$/.test(name) && !/\.test\./.test(name) ? [p] : [];
  });
}

describe('passbook class names', () => {
  it('are not used by unrelated components', () => {
    const offenders = files(root)
      .filter((f) => !OPT_IN.some((o) => f.replaceAll('\\', '/').includes(o)))
      .filter((f) => /className=[^>]*\bmv-(leaf|seal)\b/.test(readFileSync(f, 'utf8')));
    expect(offenders).toEqual([]);
  });
  it('never redefine the .mv-page wrapper', () => {
    const css = readFileSync(join(root, 'app', 'g1-tokens.css'), 'utf8');
    expect(css).not.toMatch(/\.mv-page\s*\{/);
  });
});
