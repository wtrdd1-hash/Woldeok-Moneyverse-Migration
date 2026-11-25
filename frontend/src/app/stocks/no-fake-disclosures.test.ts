import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/** QA 2026-11-25: /stocks showed a hard-coded 'LIVE' disclosure feed with price-impact ranges. */
const src = readFileSync(join(__dirname, 'page.tsx'), 'utf8');
describe('/stocks', () => {
  it('renders no hard-coded disclosure feed and no filler cards', () => {
    expect(src).not.toContain('StockDisclosureTicker');
    expect(src).not.toContain('3단 매트릭스');
    expect(src).not.toContain('전체 10종목');
  });
});
