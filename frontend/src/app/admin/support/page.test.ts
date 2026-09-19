import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const page = readFileSync(join(process.cwd(), 'src/app/admin/support/page.tsx'), 'utf8');

describe('admin support responsive and accessibility contract', () => {
  it('stacks reply and status controls on narrow screens', () => {
    expect(page).toContain('sm:grid-cols-[minmax(0,1fr)_auto]');
    expect(page).toContain('w-full rounded-xl bg-primary');
    expect(page).toContain('w-full rounded-xl border px-4');
  });

  it('keeps primary admin controls at least 44px tall and labelled', () => {
    expect(page).toContain('aria-label="관리자 답장"');
    expect(page).toContain('aria-label="문의 처리 상태"');
    expect(page.match(/min-h-11/g)?.length).toBeGreaterThanOrEqual(3);
  });

  it('keeps the admin page out of search indexing', () => {
    expect(page).toContain("robots:{index:false,follow:false}");
  });
});
