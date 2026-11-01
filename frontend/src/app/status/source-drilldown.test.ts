import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
const page = readFileSync('src/app/status/page.tsx', 'utf8');
describe('public status source drill-down UI', () => {
  it('keeps the full aggregate while rendering verified source detail and accessible reset links', () => {
    expect(page).toContain('statusAggregateState(rows)');
    expect(page).toContain('sourceKey=');
    expect(page).toContain('parseSourceStatusRows');
    expect(page).toContain('visibleRows.map(');
    expect(page).toContain('전체 상태 보기');
  });
});
