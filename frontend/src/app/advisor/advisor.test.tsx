// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

const pageSource = readFileSync('src/app/advisor/page.tsx', 'utf8');
const clientSource = readFileSync('src/app/advisor/advisor-client.tsx', 'utf8');
const diagnoseSource = readFileSync('src/app/api/advisor/deoki/diagnose/route.ts', 'utf8');
const askSource = readFileSync('src/app/api/advisor/deoki/ask/route.ts', 'utf8');

describe('AI Financial Advisor Deoki (/advisor)', () => {
  it('mounts AdvisorClient and metadata', () => {
    expect(pageSource).toContain('AdvisorClient');
    expect(pageSource).toContain('AI 금융 어드바이저');
    expect(pageSource).toContain('샤프 지수');
  });

  it('provides 4-quadrant asset allocation with score and sharpe ratio', () => {
    expect(clientSource).toContain('자산 배분 4분면 포트폴리오');
    expect(clientSource).toContain('sharpeRatio');
    expect(clientSource).toContain('annualExpectedYield');
    expect(clientSource).toContain('rebalancingAction');
  });

  it('renders interactive 1:1 chat interface with quick prompts', () => {
    expect(clientSource).toContain('덕이와의 1:1 상담실');
    expect(clientSource).toContain('내 포트폴리오 위험도는 어느 정도야?');
    expect(clientSource).toContain('/api/advisor/deoki/ask');
  });

  it('does not manufacture financial advice when backend evidence is unavailable', () => {
    expect(diagnoseSource).not.toContain('Balanced Growth');
    expect(diagnoseSource).not.toContain('12450000');
    expect(askSource).not.toContain('generateDeokiResponse');
    expect(askSource).toContain('csrfToken: session.csrfToken');
    expect(clientSource).toContain('포트폴리오 진단 증빙 확인 불가');
    expect(clientSource).toContain("json?.sourceStatus === 'VERIFIED'");
  });
});
