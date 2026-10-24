import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const card = readFileSync(new URL('./policy-version-card.tsx', import.meta.url), 'utf8');

describe('consent policy publication step-up disclosure', () => {
  it('provides a real reauthentication route before publication', () => {
    expect(card).toContain('href="/account/security"');
    expect(card).toContain('15분');
  });

  it('does not describe a confirmation phrase as two-factor authentication', () => {
    expect(card).not.toContain('법적 정책 신규 버전 발행 (2단계 확인)');
  });
});
