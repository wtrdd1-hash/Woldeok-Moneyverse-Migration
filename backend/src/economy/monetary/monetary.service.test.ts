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
      const mockOrder = { id: 'order-1', status: 'PROPOSED' };
      const approvedOrder = { id: 'order-1', status: 'APPROVED', approved_by: 'approver-1' };
      const mockPool = {
        query: vi
          .fn()
          .mockResolvedValueOnce({ rows: [mockOrder] })
          .mockResolvedValueOnce({ rows: [approvedOrder] }),
      } as unknown as Queryable;
      const cbService = new CentralBankService(mockPool);

      const res = await cbService.approvePolicyOrder('approver-1', 'order-1');
      expect(res.status).toBe('APPROVED');
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

  describe('MintBureauService', () => {
    it('fails closed when the atomic issuance guard rejects the request', async () => {
      const query = vi.fn().mockResolvedValue({ rows: [] });
      const bureau = new MintBureauService({ query } as unknown as Queryable);
      await expect(bureau.executeAuthorizedMint('admin-1', '11111111-1111-4111-8111-111111111111', '5000', null, 'idemp-1'))
        .rejects.toThrow(ForbiddenException);
      expect(query).toHaveBeenCalledTimes(1);
      expect(query.mock.calls[0]?.[0]).toContain('is_issuance_frozen = false');
      expect(query.mock.calls[0]?.[0]).toContain('executed_amount_wld::numeric + $2::numeric <= max_amount_wld::numeric');
    });

    it('reserves policy capacity and writes one certificate in the same statement', async () => {
      const certificate = {
        id: 'cert-uuid-1', amount_wld: '3000', idempotency_key: 'idemp-key-99',
      };
      const query = vi.fn().mockResolvedValue({ rows: [certificate] });
      const bureau = new MintBureauService({ query } as unknown as Queryable);
      const result = await bureau.executeAuthorizedMint(
        'admin-1', '11111111-1111-4111-8111-111111111111', '3000', null, 'idemp-key-99',
      );
      expect(result).toEqual(certificate);
      expect(query).toHaveBeenCalledTimes(1);
      const sql = query.mock.calls[0]?.[0] as string;
      expect(sql).toContain('WITH reserved AS');
      expect(sql).toContain('UPDATE public.monetary_policy_orders');
      expect(sql).toContain('INSERT INTO public.mint_certificates');
      expect(sql).toContain('FROM reserved');
    });

    it('successfully records RetirementCertificate for hard sinks', async () => {
      const mockRetireCert = {
        id: 'retire-uuid-1',
        policy_order_id: null,
        amount_wld: '15000',
        source_type: 'MARKET_BUYBACK_BURN',
        actor_id: 'admin-1',
        reason: '룬스케이프형 역매수 영구 소각 집행',
        idempotency_key: 'idemp-burn-1',
        created_at: new Date().toISOString(),
      };

      const mockPool = {
        query: vi.fn().mockResolvedValueOnce({ rows: [mockRetireCert] }),
      } as unknown as Queryable;
      const mbService = new MintBureauService(mockPool);

      const res = await mbService.retireAuthorizedAmount(
        'admin-1',
        null,
        '15000',
        'MARKET_BUYBACK_BURN',
        '룬스케이프형 역매수 영구 소각 집행',
        'idemp-burn-1',
      );
      expect(res.id).toBe('retire-uuid-1');
      expect(res.amount_wld).toBe('15000');
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

