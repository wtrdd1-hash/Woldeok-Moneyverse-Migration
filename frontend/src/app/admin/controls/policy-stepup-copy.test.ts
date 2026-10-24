import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const controls = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');
const economy = readFileSync(new URL('../economy/page.tsx', import.meta.url), 'utf8');

describe('economy policy step-up guidance', () => {
  it('links policy version operators to the real reauthentication flow', () => {
    expect(controls).toContain('최근 15분 이내 본인 재인증');
    expect(controls).toContain('href="/account/security"');
  });

  it('links auto-policy operators to the same real reauthentication flow', () => {
    expect(economy).toContain('최근 15분 이내 본인 재인증');
    expect(economy).toContain('href="/account/security"');
  });
});
