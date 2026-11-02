import { describe, expect, it, vi } from 'vitest';
import { FundedTreasuryDonationController } from './treasury.controller';
import type { TreasuryService } from './treasury.service';

describe('v1626 public funded Treasury donation endpoint', () => {
 it('binds donor to authenticated session and exact retry-stable transaction key', async () => {
   const source = vi.fn().mockResolvedValue({ success:true, donated_amount_wld:'1000', ledger_transaction_id:'11111111-1111-4111-8111-111111111111' });
   const ctl = new FundedTreasuryDonationController({ userDonate: source } as unknown as TreasuryService);
   const req = { session: { user_id:'22222222-2222-4222-8222-222222222222' } } as never;
   const dto = { amountWld: '1000', memo:'Public voluntary funds', idempotencyKey:'33333333-3333-4333-8333-333333333333' };
   await expect(ctl.userDonate(req, dto)).resolves.toMatchObject({ success:true });
   expect(source).toHaveBeenCalledExactlyOnceWith('22222222-2222-4222-8222-222222222222','1000','Public voluntary funds',dto.idempotencyKey);
 });
 it('cannot spoof a donor identity from input body', async () => {
   const source = vi.fn().mockResolvedValue({success:true});
   const ctl = new FundedTreasuryDonationController({userDonate:source} as unknown as TreasuryService);
   const req = { session: { user_id:'11111111-1111-4111-8111-111111111111' } } as never;
   await ctl.userDonate(req, { amountWld:'1000',idempotencyKey:'33333333-3333-4333-8333-333333333333', memo:'Donation',userId:'attacker' } as never);
   expect(source).toHaveBeenCalledExactlyOnceWith('11111111-1111-4111-8111-111111111111','1000','Donation','33333333-3333-4333-8333-333333333333');
 });
});
