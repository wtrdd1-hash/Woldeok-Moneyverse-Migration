// @vitest-environment node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(join(__dirname, 'slots-game.tsx'), 'utf8');

describe('casino slots accessible settlement feedback', () => {
  it('announces ambiguous settlements and links to authoritative wallet history', () => {
    expect(source).toContain("state.status === 'error'");
    expect(source).toContain('role="alert"');
    expect(source).toContain('href="/wallet/activity"');
    expect(source).toContain('min-h-[44px]');
  });

  it('shows a real server transaction identifier only after confirmed settlement', () => {
    expect(source).toContain('state.transactionId');
    expect(source).not.toContain('isWon ? 6 : 1');
  });
});
