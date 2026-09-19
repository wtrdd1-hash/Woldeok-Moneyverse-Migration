import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const page = readFileSync('src/app/status/page.tsx', 'utf8');

describe('status authoritative freshness UI', () => {
  it('renders the server-owned freshness contract instead of recomputing age in the browser layer', () => {
    expect(page).toContain("readonly freshnessState: 'fresh' | 'stale' | 'unknown';");
    expect(page).toContain("row.freshnessState !== 'fresh'");
    expect(page).toContain('asStatusState(row.state)');
    expect(page).not.toContain('statusWithFreshness(');
    expect(page).not.toContain('Date.now()');
  });

  it('keeps stale or unknown observations visibly non-current', () => {
    expect(page).toContain("needsFreshness ? '최신 확인 필요' : STATUS_LABEL[state]");
    expect(page).toContain("rows.filter((row) => row.freshnessState !== 'fresh').length");
  });
});
