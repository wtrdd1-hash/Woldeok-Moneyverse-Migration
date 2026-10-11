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

  describe('executeDepositPayout', () => {
    it('이미 대위변제 완료된 기록이 있으면 중복 지급 예외를 발생시킨다', async () => {
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({
          rows: [{ id: 'existing-payout-id', amount: 500000 }],
        }); // duplicate check

      await expect(
        repository.executeDepositPayout('BANK_1', 'user-1', 'admin-1')
      ).rejects.toThrow('해당 금융기관에 대해 이미 대위변제금이 지급 완료된 예금자입니다.');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('economy_post_transaction을 호출하여 원자적 복식부기 원장 분개를 실행한다', async () => {
      mockClient.query
        .mockResolvedValueOnce({}) // BEGIN
        .mockResolvedValueOnce({ rows: [] }) // 1. duplicate check (none)
        .mockResolvedValueOnce({ rows: [{ accountId: 'acc-user-cash' }] }) // 2. user cash acc
        .mockResolvedValueOnce({ rows: [{ fund: 10000000, protectionLimit: 500000 }] }) // 3. fund check
        .mockResolvedValueOnce({ rows: [{ totalDeposit: 400000 }] }) // 4. balance check
        .mockResolvedValueOnce({ rows: [{ accountId: 'acc-mint' }] }) // 5. mint acc
        .mockResolvedValueOnce({ rows: [{ version: 'policy-v1' }] }) // 6. policy
        .mockResolvedValueOnce({ rows: [{ id: 'admin-uuid-1' }] }) // actor check
        .mockResolvedValueOnce({ rows: [{ id: 'tx-ledger-1' }] }) // 7. economy_post_transaction
        .mockResolvedValueOnce({ rows: [{ fund: 9600000 }] }) // 8. update fund
        .mockResolvedValueOnce({}) // 9. insert payout
        .mockResolvedValueOnce({}); // COMMIT

      const res = await repository.executeDepositPayout(
        'BANK_1',
        '33333333-3333-3333-3333-333333333333',
        '22222222-2222-2222-2222-222222222222'
      );

      expect(res.payoutAmountWld).toBe(400000);
      expect(res.newFundWld).toBe(9600000);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');

      // economy_post_transaction 호출 확인
      const postTxCall = mockClient.query.mock.calls.find((c: any[]) =>
        typeof c[0] === 'string' && c[0].includes('economy_post_transaction')
      );
      expect(postTxCall).toBeDefined();
    });
  });
});
