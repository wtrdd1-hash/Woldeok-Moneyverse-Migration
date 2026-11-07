// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
const pageSource = readFileSync('src/app/advisor/page.tsx', 'utf8');
const clientSource = readFileSync('src/app/advisor/advisor-client.tsx', 'utf8');
const rebalanceSource = readFileSync('src/app/api/advisor/deoki/rebalance/execute/route.ts', 'utf8');

describe('advisor read-only source truth', () => {
  it('labels the virtual diagnosis and does not promise real-time AI or market execution', () => {
    expect(pageSource).toContain('가상 자산 진단');
    expect(pageSource).toContain('robots: { index: false, follow: false }');
    expect(pageSource).not.toMatch(/샤프 지수 1\.84|실시간 종합 분석|최적의 리밸런싱/);
    expect(clientSource).not.toMatch(/시장가로 즉시 체결|1,245만 WLD|수수료 50% 우대|자산 분산도 88%/);
  });

  it('shows verified source evidence or an accessible unavailable state, never fake receipts', () => {
    expect(clientSource).toContain('parseVerifiedAdvisorResponse');
    expect(clientSource).toContain('포트폴리오 진단 증빙 확인 불가');
    expect(clientSource).toContain('aria-live="polite"');
    expect(clientSource).toContain('다시 확인');
    expect(clientSource).toContain('min-h-11');
    expect(rebalanceSource).toContain('ADVISOR_REBALANCE_UNVERIFIED');
    expect(rebalanceSource).not.toContain('SIMULATED_FILLED');
  });
});
