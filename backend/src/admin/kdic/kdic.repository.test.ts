import { describe, it, expect, vi, beforeEach } from 'vitest';
import { KdicRepository } from './kdic.repository';
import { Pool } from 'pg';

describe('KdicRepository', () => {
  let repository: KdicRepository;
  let mockPool: any;
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      query: vi.fn(),
      release: vi.fn(),
    };
    mockPool = {
      query: vi.fn(),
      connect: vi.fn().mockResolvedValue(mockClient),
    };
    repository = new KdicRepository(mockPool as unknown as Pool);
  });

  describe('getUserInsuredCoverage', () => {
    it('올바른 스키마(owner_user_id, available_amount)를 쿼리하고 한도 내 보장 금액을 산출한다', async () => {
      mockPool.query
        .mockResolvedValueOnce({
          rows: [{ protectionLimit: 500000 }],
        })
        .mockResolvedValueOnce({
          rows: [{ totalDeposit: 300000 }],
        });

      const coverage = await repository.getUserInsuredCoverage('test-user-id');
      expect(coverage.totalDepositWld).toBe(300000);
      expect(coverage.protectionLimitWld).toBe(500000);
      expect(coverage.protectedAmountWld).toBe(300000);
      expect(coverage.unprotectedAmountWld).toBe(0);
      expect(coverage.isFullyProtected).toBe(true);
      expect(coverage.coverageRatioPct).toBe(100);

      const balanceQueryCall = mockPool.query.mock.calls[1][0];
      expect(balanceQueryCall).toContain('a.owner_user_id = $1');
      expect(balanceQueryCall).toContain('ab.available_amount');
    });
  });

  describe('legacy KDIC financial writers', () => {
    it('never opens a database connection or returns an unverified settlement receipt', async () => {
      for (const operation of [
        repository.assessQuarterlyPremiums('admin'),
        repository.injectEmergencyLiquidity('BANK_1', 1000000, 'admin'),
        repository.executeDepositPayout('BANK_1', 'user', 'admin'),
      ]) {
        await expect(operation).rejects.toMatchObject({
          status: 503,
          response: expect.objectContaining({ code: 'KDIC_LEDGER_SETTLEMENT_UNVERIFIED' }),
        });
      }
      expect(mockPool.connect).not.toHaveBeenCalled();
      expect(mockPool.query).not.toHaveBeenCalled();
    });
  });

});
