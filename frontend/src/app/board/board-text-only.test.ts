import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('public board text-only discovery UI', () => {
  it('offers an accessible filter, preserves title/stock query and does not index filtered results', () => {
    const page = readFileSync('src/app/board/page.tsx', 'utf8');
    expect(page).toContain('name="media"');
    expect(page).toContain('게시글 유형');
    expect(page).toContain('query.set(\'media\', \'text\')');
    expect(page).toContain('robots: { index: !hasSearch');
    expect(page).toContain('verifiedTextOnlyBoardResponse');
  });
});
