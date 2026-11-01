import { describe, expect, it, vi } from 'vitest';
import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { NationalPensionRepository } from './national-pension.repository';
import { NationalPensionService } from './national-pension.service';
import { PublicNationalPensionController } from './national-pension.controller';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { SessionGuard } from '../../auth/guards/session.guard';

const actor = '5f7b8b44-e4aa-40b8-b93a-800ec0151d20';
const key = 'aaaa2222-bbbb-4222-8222-ccccdddd0001';
const receipt = {
  ledger_transaction_id: '11111111-1111-4111-8111-111111111111',
  principal_wld: '1000',
  user_disbursement_wld: '0',
  welfare_fee_wld: '0',
  fund_balance_wld: '1000',
  replayed: false,
};
const setup = () => {
  const query = vi.fn().mockResolvedValue({ rows: [receipt] });
  const repo = new NationalPensionRepository({ query } as never);
  return { repo, query };
};

describe('v1618 one Treasury Core for new funded National Pension', () => {
  it('routes a real verified actor+idempotency key to one DB-owned posting command, never raw DML', async () => {
    const { repo, query } = setup();
    const res = await repo.postFundedPension(actor, key, 'NPS_FUND', '1000');
    expect(res).toEqual(receipt);
    expect(query).toHaveBeenCalledOnce();
    expect(query.mock.calls[0][0]).toBe(
      'SELECT * FROM public.treasury_core_post($1::uuid,$2::uuid,$3::text,$4::text)',
    );
    expect(query.mock.calls[0][1]).toEqual([actor, key, 'NPS_FUND', '1000']);
  });

  it('never converts exact huge WLD integer to unsafe JS Number', async () => {
    const { repo, query } = setup();
    const big = '100000000000000000000000';
    query.mockResolvedValue({ rows: [{ ...receipt, principal_wld: big, fund_balance_wld: big }] });
    expect((await repo.postFundedPension(actor, key, 'NPS_FUND', big)).principal_wld).toBe(big);
    expect(query.mock.calls[0][1][3]).toBe(big);
  });

  it('rejects invalid idempotency and subminimum amounts before DB IO', async () => {
    const { repo, query } = setup();
    await expect(repo.postFundedPension(actor, 'wrong', 'NPS_FUND', '1000'))
      .rejects.toBeInstanceOf(BadRequestException);
    await expect(repo.postFundedPension(actor, key, 'NPS_FUND', '999'))
      .rejects.toBeInstanceOf(BadRequestException);
    await expect(repo.postFundedPension(actor, key, 'NPS_FUND', '-1000'))
      .rejects.toThrow();
    expect(query).not.toHaveBeenCalled();
  });

  it('refuses missing/invalid actual DB ledger receipts instead of claiming financial settlement', async () => {
    const { repo, query } = setup();
    query.mockResolvedValueOnce({ rows: [] });
    await expect(repo.postFundedPension(actor, key, 'NPS_FUND', '1000'))
      .rejects.toBeInstanceOf(ServiceUnavailableException);
    query.mockResolvedValueOnce({ rows: [{ ...receipt, ledger_transaction_id: '' }] });
    await expect(repo.postFundedPension(actor, key, 'NPS_FUND', '1000'))
      .rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('preserves repayment under the same trusted DB core, not legacy pension vault SQL', async () => {
    const { repo, query } = setup();
    query.mockResolvedValueOnce({ rows: [{
      ...receipt, user_disbursement_wld: '950', welfare_fee_wld: '50', fund_balance_wld: '0',
    }] });
    const result = await repo.postFundedPension(actor, key, 'NPS_WITHDRAW', '1000');
    expect(result.user_disbursement_wld).toBe('950');
    expect(result.welfare_fee_wld).toBe('50');
    expect(query.mock.calls[0][1][2]).toBe('NPS_WITHDRAW');
  });

  it('never grants direct NPS legacy balances for empty funded positions', async () => {
    const { repo, query } = setup();
    query.mockResolvedValueOnce({ rows: [{
      funded_principal_wld: '0', cumulative_funded_contribution_wld: '0',
      escrow_balance_wld: '0', certified_receipt_count: '0',
    }] });
    expect((await repo.getFundedPosition(actor)).funded_principal_wld).toBe('0');
    expect(query.mock.calls[0][0]).toBe(
      'SELECT * FROM public.treasury_core_pension_position($1::uuid)',
    );
  });

  it('does not let BFF CSRF or login/session be bypassed on new money endpoints', () => {
    for (const route of ['contributeFunded', 'withdrawFunded'] as const) {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA, PublicNationalPensionController.prototype[route],
      ) as unknown[];
      expect(guards).toContain(CsrfGuard);
      expect(guards).toContain(SessionGuard);
    }
  });

  it('service forwards the session actor and key unchanged', async () => {
    const repo = {
      postFundedPension: vi.fn().mockResolvedValue(receipt),
    } as unknown as NationalPensionRepository;
    const service = new NationalPensionService(repo);
    await service.contributeFunded(actor, key, '1000');
    expect(repo.postFundedPension).toHaveBeenCalledWith(actor, key, 'NPS_FUND', '1000');
  });
});
