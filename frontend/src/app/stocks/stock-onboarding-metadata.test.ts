import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Stock exchange SEO grant truth', () => {
  it('does not promise a WLD grant without a verified award contract', () => {
    const source = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');
    expect(source).not.toContain('가입 즉시 1만 WLD 지급!');
    expect(source).toContain('서버에서 확인된 가상 거래 내역');
  });
});
