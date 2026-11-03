import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../../core/db';
import { CentralBankService } from './central-bank.service';
import { MintBureauService } from './mint-bureau.service';

describe('v523 Monetary & Central Bank / Mint Bureau Separation', () => {
  describe('CentralBankService', () => {
    it('rejects policy orders with non-positive or invalid amounts', async () => {
      const mockPool = { query: vi.fn() } as unknown as Queryable;
      const cbService = new CentralBankService(mockPool);

      await expect(
        cbService.proposePolicyOrder('admin-1', 'MINT', 'WORK_REWARD', '0', '작업 보상 재원 한도 승인 요청'),
      ).rejects.toThrow(BadRequestException);

      await expect(
        cbService.proposePolicyOrder('admin-1', 'MINT', 'WORK_REWARD', '-500', '작업 보상 재원 한도 승인 요청'),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects policy orders with too short reason', async () => {
      const mockPool = { query: vi.fn() } as unknown as Queryable;
      const cbService = new CentralBankService(mockPool);

      await expect(
        cbService.proposePolicyOrder('admin-1', 'MINT', 'WORK_REWARD', '100000', '짧은이유'),
      ).rejects.toThrow(BadRequestException);
    });

    it('successfully proposes and returns a policy order', async () => {
      const mockOrder = {
        id: 'order-uuid-1',
        order_type: 'MINT',
        target_envelope: 'WORK_REWARD',
        max_amount_wld: '100000',
        executed_amount_wld: '0',
        status: 'PROPOSED',
        proposed_by: 'admin-1',
        reason: '2026년 4분기 작업 보상 풀 중앙은행 발행 승인 요청',
        expires_at: new Date().toISOString(),
      };
      const mockPool = {
        query: vi.fn().mockResolvedValue({ rows: [mockOrder] }),
      } as unknown as Queryable;
      const cbService = new CentralBankService(mockPool);

      const res = await cbService.proposePolicyOrder(
        'admin-1',
        'MINT',
        'WORK_REWARD',
        '100000',
        '2026년 4분기 작업 보상 풀 중앙은행 발행 승인 요청',
      );

      expect(res.id).toBe('order-uuid-1');
      expect(res.status).toBe('PROPOSED');
      expect(res.max_amount_wld).toBe('100000');
    });

    it('approves a proposed policy order', async () => {
      const orderId = '11111111-1111-4111-8111-111111111111';
      const approverId = '22222222-2222-4222-8222-222222222222';
      const approvedOrder = { id: orderId, status: 'APPROVED', approved_by: approverId,
        proposed_by: '33333333-3333-4333-8333-333333333333' };
      const query = vi.fn().mockResolvedValueOnce({ rows: [approvedOrder] });
      const cbService = new CentralBankService({ query } as unknown as Queryable);
      const res = await cbService.approvePolicyOrder(approverId, orderId);
      expect(res.status).toBe('APPROVED');
      expect(query).toHaveBeenCalledExactlyOnceWith(
        'SELECT * FROM public.monetary_approve_policy_order($1::uuid,$2::uuid)',
        [approverId,orderId],
      );
    });

    it('freezes issuance when authorized', async () => {
      const mockPool = {
        query: vi.fn().mockResolvedValue({ rows: [] }),
      } as unknown as Queryable;
      const cbService = new CentralBankService(mockPool);

      const res = await cbService.freezeIssuance('admin-1', '거시경제 통화량 급변 이상감지에 따른 긴급 발행 동결');
      expect(res.is_issuance_frozen).toBe(true);
    });
  });

  describe('MintBureauService canonical verification', () => {
    const actor = '11111111-1111-4111-8111-111111111111';
    const order = '22222222-2222-4222-8222-222222222222';
    const user = '33333333-3333-4333-8333-333333333333';
    const key = '44444444-4444-4444-8444-444444444444';
    it('never treats a rejected canonical DB mint as an approved certificate', async () => {
      const query = vi.fn().mockResolvedValue({ rows: [] });
      const bureau = new MintBureauService({ query } as unknown as Queryable);
      await expect(bureau.executeAuthorizedMint(actor, order, '5000', user, key))
        .rejects.toThrow();
      expect(query).toHaveBeenCalledExactlyOnceWith(
        'SELECT * FROM public.monetary_execute_canonical_mint($1::uuid,$2::uuid,$3::text,$4::uuid,$5::uuid)',
        [actor, order, '5000', user, key],
      );
    });
    it('accepts only a ledger-linked receipt from the single database command', async () => {
      const certificate = {
        id: '55555555-5555-4555-8555-555555555555',
        policy_order_id: order, recipient_user_id: user,
        idempotency_key: key, actor_id: actor, amount_wld: '3000',
        ledger_transaction_id: '66666666-6666-4666-8666-666666666666',
        evidence_digest: 'f'.repeat(64), replayed: false,
      };
      const query = vi.fn().mockResolvedValue({ rows: [certificate] });
      const bureau = new MintBureauService({ query } as unknown as Queryable);
      expect(await bureau.executeAuthorizedMint(actor, order, '3000', user, key)).toEqual(certificate);
      expect(query).toHaveBeenCalledOnce();
    });
    it('retirement certificates require a separate funded canonical sink command', async () => {
      const query = vi.fn();
      const bureau = new MintBureauService({ query } as unknown as Queryable);
      await expect(bureau.retireAuthorizedAmount(actor, null, '15000', 'MARKET_BUYBACK_BURN', 'No verified source', key))
        .rejects.toThrow(ForbiddenException);
      expect(query).not.toHaveBeenCalled();
    });
  });

  describe('CentralBankService - AI Council Integration', () => {
    it('generates multi-agent council recommendation and proposes order successfully', async () => {
      const mockPool = {
        query: vi.fn().mockImplementation((queryText: string) => {
          if (queryText.includes('FROM public.system_treasury_vaults')) {
            return Promise.resolve({
              rows: [
                {
                  treasury_wld: '50000000',
                  user_balances_wld: '30000',
                  is_issuance_frozen: false,
                },
              ],
            });
          }
          if (queryText.includes('FROM public.monetary_policy_orders WHERE status')) {
            return Promise.resolve({
              rows: [{ active_orders: '1', mints: '2', retirements: '3' }],
            });
          }
          if (queryText.includes('INSERT INTO public.monetary_policy_orders')) {
            return Promise.resolve({
              rows: [
                {
                  id: 'order-ai-1',
                  order_type: 'MINT',
                  target_envelope: 'WORK_REWARD',
                  max_amount_wld: '300000',
                  status: 'PROPOSED',
                  reason: '[AI 정책 위원회 정기 권고안]...',
                },
              ],
            });
          }
          return Promise.resolve({ rows: [] });
        }),
      } as unknown as Queryable;
      const cbService = new CentralBankService(mockPool);

      const rec = await cbService.generateAiCouncilRecommendation();
      expect(rec.consensus_score).toBeGreaterThan(0.8);
      expect(rec.agent_opinions.length).toBe(3);
      expect(rec.synthesis_reason).toContain('[AI 정책 위원회 정기 권고안]');

      const order = await cbService.proposeFromAiCouncil('admin-test');
      expect(order.id).toBe('order-ai-1');
      expect(order.status).toBe('PROPOSED');
    });
  });
});

