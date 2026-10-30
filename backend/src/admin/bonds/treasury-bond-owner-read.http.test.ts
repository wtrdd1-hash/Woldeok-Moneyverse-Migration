import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import type { Pool } from 'pg';
import request from 'supertest';
import { SessionGuard } from '../../auth/guards/session.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';

const actor = '11111111-1111-4111-8111-111111111111';
vi.mock('../../auth/session.context', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../auth/session.context')>()),
  requireUserId: () => actor,
}));
import { PublicTreasuryBondController } from './treasury-bond.controller';
import { TreasuryBondService } from './treasury-bond.service';
import { TreasuryBondRepository } from './treasury-bond.repository';

describe('bond member read HTTP to SQL contract', () => {
  let app: INestApplication;
  const query = vi.fn(async (sql: string, args?: unknown[]) => {
    if (sql.includes('bond_owner_holdings')) return { rows: [{ id: 'h1', user_id: actor, purchase_price_total_wld: '9007199254740993' }] };
    if (sql.includes('bond_owner_repo_loans')) return { rows: [{ id: 'l1', user_id: actor, principal_wld: '9007199254740993' }] };
    if (sql.includes('bond_public_read_totals')) return { rows: [{ holders_count: '1', coupons_paid_wld: '3', repo_active_principal_wld: '7' }] };
    if (sql.includes('COUNT(*)::text')) return { rows: [{ count: '1', total_funded: '10' }] };
    if (sql.includes('bond_public_catalog')) return { rows: [{ symbol: 'KTB-01Y', status: 'TRADING', annual_coupon_rate_bps: 450 }] };
    throw new Error(`Unexpected SQL: ${sql} ${args?.length ?? 0}`);
  });
  beforeAll(async () => {
    const repo = new TreasuryBondRepository({ query } as unknown as Pool);
    const testingModule = await Test.createTestingModule({
      controllers: [PublicTreasuryBondController],
      providers: [{ provide: TreasuryBondService, useValue: new TreasuryBondService(repo) }],
    }).overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(CsrfGuard).useValue({ canActivate: () => true })
      .compile();
    app = testingModule.createNestApplication();
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it('returns owner holdings without accepting a forged query owner', async () => {
    const res = await request(app.getHttpServer()).get('/bonds/my-holdings?userId=22222222-2222-4222-8222-222222222222').expect(200);
    expect(res.body).toMatchObject([{ user_id: actor, purchase_price_total_wld: '9007199254740993' }]);
    expect(query.mock.calls.find(([sql]) => sql.includes('bond_owner_holdings'))?.[1]).toEqual([actor]);
  });
  it('returns owner repo loans with exact integer strings', async () => {
    const res = await request(app.getHttpServer()).get('/bonds/my-repo-loans').expect(200);
    expect(res.body).toMatchObject([{ user_id: actor, principal_wld: '9007199254740993' }]);
    expect(query.mock.calls.find(([sql]) => sql.includes('bond_owner_repo_loans'))?.[1]).toEqual([actor]);
  });
  it('returns public market catalogue and aggregate-only overview', async () => {
    const res = await request(app.getHttpServer()).get('/bonds/markets').expect(200);
    expect(res.body.overview).toMatchObject({ totalHoldersCount: 1, totalCouponsPaidWld: '3', totalRepoLoansWld: '7' });
    expect(res.body.bonds[0].symbol).toBe('KTB-01Y');
    expect(query.mock.calls.map(([sql]) => sql).join(' ')).not.toMatch(/FROM public\.treasury_bond_holdings|FROM public\.treasury_bond_repo_loans|FROM public\.treasury_bonds/);
  });
});
