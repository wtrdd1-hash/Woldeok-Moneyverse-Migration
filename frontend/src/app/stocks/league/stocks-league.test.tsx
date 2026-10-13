// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

const pageSource = readFileSync('src/app/stocks/league/page.tsx', 'utf8');
const clientSource = readFileSync('src/app/stocks/league/stocks-league-client.tsx', 'utf8');
const combinedSource = `${pageSource}\n${clientSource}`;

describe('Stocks Copy-Trading League & Whale Leaderboard (/stocks/league)', () => {
  it('mounts StocksLeagueClient and metadata', () => {
    expect(pageSource).toContain('StocksLeagueClient');
    expect(pageSource).toContain('가상 주식 카피 트레이딩 리그');
    expect(pageSource).toContain('Whale League');
  });

  it('renders Whale leaderboard with top return rates and badges', () => {
    expect(clientSource).toContain('여의도_헤지펀드_마스터');
    expect(clientSource).toContain('184.2');
    expect(clientSource).toContain('카피 트레이딩');
    expect(clientSource).toContain('followersCount');
  });

  it('provides copy trading subscription dialog with budget and ratio', () => {
    expect(clientSource).toContain('allocatedBudget');
    expect(clientSource).toContain('copyRatio');
    expect(clientSource).toContain('수익 실현 시 1.0% 트레이더 분배');
    expect(clientSource).toContain('/api/stocks/league/copy-trade/subscribe');
  });

  it('tracks active subscriptions with profit calculations and cancel action', () => {
    expect(clientSource).toContain('mySubscriptions');
    expect(clientSource).toContain('handleUnsubscribe');
    expect(clientSource).toContain('누적 실현 손익');
  });
});
