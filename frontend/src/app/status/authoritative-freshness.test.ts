import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const page = readFileSync('src/app/status/page.tsx', 'utf8');

describe('status authoritative freshness UI', () => {
  it('uses the server-owned freshness signal in both the overall headline and individual badge', () => {
    expect(page).toContain("readonly freshnessState: 'fresh' | 'stale' | 'unknown';");
    expect(page).toContain('overallState(rows.map((row) => statusFromSnapshot(row.state, row.freshnessState)))');
    expect(page).toContain('const state = statusFromSnapshot(row.state, row.freshnessState);');
    expect(page).toContain('variant={VARIANT[state]}');
    expect(page).not.toContain('statusWithFreshness(');
    expect(page).not.toContain('Date.now()');
  });

  it('keeps stale observations visibly non-current without asserting a fixed policy threshold', () => {
    expect(page).toContain("needsFreshness ? '최신 확인 필요' : STATUS_LABEL[state]");
    expect(page).toContain("rows.filter((row) => row.freshnessState !== 'fresh').length");
    expect(page).not.toContain('두 번의 수집 주기(60초)를 넘긴 기록');
    expect(page).toContain('최신성은 서버의 상태 정책에 따라 판정됩니다.');
    expect(page).toContain('robots: { index: false, follow: false }');
  });
});
