import { BadRequestException, ForbiddenException, ServiceUnavailableException } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../../core/db';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { MonetaryController } from './monetary.controller';
import { MintBureauService } from './mint-bureau.service';

const actor = '11111111-1111-4111-8111-111111111111';
const order = '22222222-2222-4222-8222-222222222222';
const recipient = '33333333-3333-4333-8333-333333333333';
const key = '44444444-4444-4444-8444-444444444444';
const tx = '55555555-5555-4555-8555-555555555555';
const proof = {
  id: '66666666-6666-4666-8666-666666666666',
  policy_order_id: order,
  actor_id: actor,
  recipient_user_id: recipient,
  amount_wld: '1000',
  idempotency_key: key,
  ledger_transaction_id: tx,
  evidence_digest: 'a'.repeat(64),
  replayed: false,
};
describe('v1653 canonical Mint execution is not a standalone certificate', () => {
  it('routes an explicit recipient and trusted actor to one DB-owned canonical command', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [proof] });
    const sut = new MintBureauService({ query } as unknown as Queryable);
    const result = await sut.executeAuthorizedMint(actor, order, '1000', recipient, key);
    expect(result).toMatchObject(proof);
    expect(query).toHaveBeenCalledExactlyOnceWith(
      'SELECT * FROM public.monetary_execute_canonical_mint($1::uuid,$2::uuid,$3::text,$4::uuid,$5::uuid)',
      [actor, order, '1000', recipient, key],
    );
  });

  it('does not convert a malformed DB response into successful minting', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ ...proof, ledger_transaction_id: null }] })
      .mockResolvedValueOnce({ rows: [{ ...proof, amount_wld: '999' }] });
    const sut = new MintBureauService({ query } as unknown as Queryable);
    for (let i = 0; i < 3; i++) {
      await expect(sut.executeAuthorizedMint(actor, order, '1000', recipient, key))
        .rejects.toBeInstanceOf(ServiceUnavailableException);
    }
  });

  it('rejects null recipient, fake actor, malformed UUID keys and fractional WLD before database I/O', async () => {
    const query = vi.fn();
    const sut = new MintBureauService({ query } as unknown as Queryable);
    for (const params of [
      [actor, order, '1000', null, key],
      ['attacker', order, '1000', recipient, key],
      [actor, order, '0', recipient, key],
      [actor, order, '1.5', recipient, key],
      [actor, order, '1000', recipient, 'arbitrary'],
    ] as const) {
      await expect(sut.executeAuthorizedMint(...params)).rejects.toBeInstanceOf(BadRequestException);
    }
    expect(query).not.toHaveBeenCalled();
  });

  it('requires CSRF and uses the server session actor rather than a body supplied admin ID', async () => {
    const issued = vi.fn().mockResolvedValue(proof);
    const controller = new MonetaryController({} as never, { executeAuthorizedMint: issued } as never, {} as never);
    const guards = Reflect.getMetadata(GUARDS_METADATA, MonetaryController.prototype.executeMint) as unknown[];
    expect(guards).toContain(CsrfGuard);
    await expect(controller.executeMint({ session: { user_id: actor } } as never, {
      policy_order_id: order, amount_wld: '1000', recipient_user_id: recipient, idempotency_key: key,
    })).resolves.toMatchObject(proof);
    expect(issued).toHaveBeenCalledExactlyOnceWith(actor, order, '1000', recipient, key);
  });

  it('never certifies a retirement without canonical funded ledger evidence, even with a policy ID', async () => {
    const query = vi.fn();
    const sut = new MintBureauService({ query } as unknown as Queryable);
    await expect(sut.retireAuthorizedAmount(actor, null, '1000', 'SINK', 'ordinary retirement', key))
      .rejects.toBeInstanceOf(ForbiddenException);
    await expect(sut.retireAuthorizedAmount(actor, order, '1000', 'SINK', 'ordinary retirement', key))
      .rejects.toBeInstanceOf(ForbiddenException);
    expect(query).not.toHaveBeenCalled();
  });
});
