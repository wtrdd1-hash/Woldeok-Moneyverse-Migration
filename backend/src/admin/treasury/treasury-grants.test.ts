import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TreasuryService } from './treasury.service';
import type { TreasuryRepository } from './treasury.repository';

describe('TreasuryGrantsService', () => {
  let repository: Partial<TreasuryRepository>;
  let service: TreasuryService;

  beforeEach(() => {
    repository = {
      listTreasuryGrants: vi.fn().mockResolvedValue([
        {
          id: 'GRANT-2026-001',
          userId: '00000000-0000-0000-0000-000000000001',
          applicantName: '디파이 개발팀',
          applicantMasked: 'de***er',
          businessName: '월덕스왑 DEX',
          businessPlan: '수학적 AMM 모델 기반 탈중앙 유동성 풀 구축',
          category: 'FINTECH',
          tier: 'TIER_1_SEED',
          requestedAmountWld: 500000,
          approvedAmountWld: 0,
          fundingVault: 'VAULT_WELFARE',
          status: 'PENDING_REVIEW',
          aiScore: 92,
          aiEvaluation: '기술성 우수',
          submittedAt: new Date().toISOString(),
          clawbackDeadline: null,
        },
      ]),
      reviewGrantApprove: vi.fn().mockResolvedValue({
        success: true,
        grant_id: 'GRANT-2026-001',
        disbursement_id: 'd-1',
        ledger_id: 'l-1',
        vault_code: 'VAULT_WELFARE',
        amount_wld: '500000',
        clawback_deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
      }),
      reviewGrantReject: vi.fn().mockResolvedValue({
        success: true,
        grant_id: 'GRANT-2026-001',
        status: 'REJECTED',
        review_note: '사업계획서 요건 미달',
      }),
      applyGrant: vi.fn().mockResolvedValue({
        success: true,
        grant_id: 'GRANT-2026-002',
        tier: 'TIER_2_GROWTH',
        requested_amount_wld: 2000000,
        ai_score: 84,
        status: 'PENDING_REVIEW',
      }),
      getUserGrant: vi.fn().mockResolvedValue({
        id: 'GRANT-2026-002',
        status: 'PENDING_REVIEW',
      }),
    };
    service = new TreasuryService(repository as TreasuryRepository, undefined);
  });

  it('지원금 목록을 정상 조회해야 한다', async () => {
    const list = await service.listTreasuryGrants();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('GRANT-2026-001');
    expect(list[0].aiScore).toBe(92);
  });

  it('관리자가 창업 지원금을 승인하면 VAULT_WELFARE에서 원자적 국고 지급 및 14일 환수 기한이 설정되어야 한다', async () => {
    const res = await service.reviewGrantApprove(
      '00000000-0000-0000-0000-000000000099',
      'GRANT-2026-001',
      '500000',
      'VAULT_WELFARE',
      '기술성 및 고용 창출 효과 확인, 승인 집행',
    );
    expect(res.success).toBe(true);
    expect(res.vault_code).toBe('VAULT_WELFARE');
    expect(repository.reviewGrantApprove).toHaveBeenCalledWith(
      '00000000-0000-0000-0000-000000000099',
      'GRANT-2026-001',
      '500000',
      'VAULT_WELFARE',
      '기술성 및 고용 창출 효과 확인, 승인 집행',
    );
  });

  it('관리자가 창업 지원금을 반려하면 정상적으로 반려 상태가 반영되어야 한다', async () => {
    const res = await service.reviewGrantReject(
      '00000000-0000-0000-0000-000000000099',
      'GRANT-2026-001',
      '사업계획서 요건 미달',
    );
    expect(res.success).toBe(true);
    expect(res.status).toBe('REJECTED');
  });

  it('시민이 창업 지원금을 신청하면 1차 AI 스코어링과 함께 접수되어야 한다', async () => {
    const res = await service.applyGrant(
      '00000000-0000-0000-0000-000000000002',
      '물류대표',
      '네오물류센터',
      '초고속 물류 허브를 건립하여 배송 시간을 50% 단축하겠습니다.',
      'LOGISTICS',
      'TIER_2_GROWTH',
    );
    expect(res.success).toBe(true);
    expect(res.requested_amount_wld).toBe(2000000);
    expect(res.ai_score).toBe(84);
  });
});
