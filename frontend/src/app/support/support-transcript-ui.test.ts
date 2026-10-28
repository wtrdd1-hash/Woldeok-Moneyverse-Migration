import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const page = readFileSync(join(process.cwd(), 'src/app/support/page.tsx'), 'utf8');

describe('member support transcript download UX', () => {
  it('only renders the download link in the selected owner conversation branch', () => {
    expect(page).toContain('!selected ?');
    expect(page).toContain('`/support/transcript/${encodeURIComponent(selected)}`');
    expect(page).toContain('오래된 순으로 최대 500건까지');
  });
  it('provides a labelled, keyboard-focusable, touch-size download control', () => {
    expect(page).toContain('aria-label="선택한 관리자 문의의 대화 내역 CSV 다운로드"');
    expect(page).toContain('min-h-11');
    expect(page).toContain('focus-visible:outline');
    expect(page).toContain('robots: { index: false, follow: false }');
  });
});
