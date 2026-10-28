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

describe('status summary freshness regression', () => {
  it('uses the freshness-aware aggregate rather than raw status values', () => {
    expect(page).toContain('statusAggregateState(rows)');
    expect(page).not.toContain('overallState(rows.map((row) => asStatusState(row.state)))');
  });

  it('distinguishes stale observations from an empty status board', () => {
    expect(page).toContain('최신 서비스 상태를 확인 중이에요.');
  });
});

describe('status accessibility and SEO boundaries', () => {
  it('announces the overall state and never indexes transient operational snapshots', () => {
    expect(page).toContain('role="status" aria-live="polite"');
    expect(page).toContain('robots: { index: false, follow: false }');
  });

  it('retains responsive layouts and keyboard-accessible native navigation', () => {
    expect(page).toContain('sm:grid-cols-2');
    expect(page).toContain('<Link href="/announcements"');
    expect(page).toContain("VARIANT[needsFreshness ? 'unknown' : state]");
  });
});
