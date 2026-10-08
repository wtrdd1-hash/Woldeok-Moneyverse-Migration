import { describe, expect, it } from 'vitest';
import { DeokiAdvisorRepository } from './deoki-advisor.repository';

class MockQueryable {
  public queries: Array<{ sql: string; params: any[] }> = [];
  public results: any[] = [];

  async query(sql: string, params: any[] = []) {
    this.queries.push({ sql, params });
    const nextResult = this.results.shift();
    return nextResult || { rows: [] };
  }
}

describe('DeokiAdvisorRepository Unit Tests', () => {
  it('유저의 자산을 분석하여 PR-Index와 리스크 레벨을 정상 산출한다', async () => {
    const mockDb = new MockQueryable();
    // 1. cash
    mockDb.results.push({ rows: [{ balance: '300000' }] });
    // 2. savings
    mockDb.results.push({ rows: [{ balance: '200000' }] });
    // 3. stocks
    mockDb.results.push({
      rows: [
        { symbol: 'TECH', shares: '10', current_price: '50000', eval_value: '500000' },
      ],
    });
    // 4. bonds
    mockDb.results.push({ rows: [{ total_bonds: '0' }] });
    // 5. insert diagnosis
    mockDb.results.push({
      rows: [
        {
          id: 'diag-1',
          user_id: 'user-1',
          pr_index: 85,
          risk_level: 'VERY_LOW',
          asset_summary: {
            cash: 300000,
            savings: 200000,
            stocks: 500000,
            bonds: 0,
            total: 1000000,
            stockCount: 1,
            topStockSymbol: 'TECH',
            topStockRatio: 100,
          },
          diagnostic_notes: ['안정적입니다'],
          rebalance_suggestions: [],
          created_at: '2026-10-08T00:00:00Z',
        },
      ],
    });

    const repo = new DeokiAdvisorRepository(mockDb as any);
    const diagnosis = await repo.diagnoseUserPortfolio('user-1');

    expect(diagnosis).not.toBeNull();
    expect(diagnosis.prIndex).toBe(85);
    expect(diagnosis.riskLevel).toBe('VERY_LOW');
    expect(diagnosis.assetSummary.total).toBe(1000000);
  });

  it('덕이에게 상담 질문을 던지면 분석 조언과 팁을 반환한다', async () => {
    const mockDb = new MockQueryable();
    // 1. cash
    mockDb.results.push({ rows: [{ balance: '100000' }] });
    // 2. savings
    mockDb.results.push({ rows: [{ balance: '0' }] });
    // 3. stocks
    mockDb.results.push({ rows: [] });
    // 4. bonds
    mockDb.results.push({ rows: [{ total_bonds: '0' }] });
    // 5. insert diagnosis
    mockDb.results.push({
      rows: [
        {
          id: 'diag-2',
          user_id: 'user-1',
          pr_index: 70,
          risk_level: 'MODERATE',
          asset_summary: {
            cash: 100000,
            savings: 0,
            stocks: 0,
            bonds: 0,
            total: 100000,
            stockCount: 0,
            topStockSymbol: null,
            topStockRatio: 0,
          },
          diagnostic_notes: ['균형잡힌 자산'],
          rebalance_suggestions: [],
          created_at: '2026-10-08T00:00:00Z',
        },
      ],
    });

    const repo = new DeokiAdvisorRepository(mockDb as any);
    const result = await repo.askDeoki('user-1', '주식 추천해줘');

    expect(result.answer).toContain('꽥! 덕이가 분석해 드릴게요!');
    expect(result.tips.length).toBeGreaterThan(0);
  });
});
