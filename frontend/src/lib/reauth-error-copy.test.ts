import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const mutateSource = readFileSync(new URL('./mutate.ts', import.meta.url), 'utf8');

describe('security reauthentication errors', () => {
  it('does not instruct the user to click a non-existent identity verification button', () => {
    expect(mutateSource).not.toContain('본인 확인하러 가기');
    expect(mutateSource).toContain('계정 보안 설정');
  });
});
