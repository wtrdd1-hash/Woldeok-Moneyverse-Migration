import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('arcade recorded-history download', () => {
  it('offers a native keyboard-accessible link on the member history card', () => {
    const page = readFileSync(new URL('../../page.tsx', import.meta.url), 'utf8');
    expect(page).toContain('href="/arcade/history/export"');
    expect(page).toContain('게임 기록 CSV');
  });
});
