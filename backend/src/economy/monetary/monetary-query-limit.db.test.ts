import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { Queryable } from '../../core/db';
import { SessionGuard } from '../../auth/guards/session.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { CentralBankService } from './central-bank.service';
import { MintBureauService } from './mint-bureau.service';
import { AutoMonetaryRegulationService } from './auto-monetary-regulation.service';
import { MonetaryController } from './monetary.controller';

const isolatedUrl = process.env.MONEYVERSE_B609_ISOLATED_PG_URL;
const cases = [
  '/admin/economy/monetary/auto-regulation/events',
  '/admin/economy/monetary/orders',
  '/admin/economy/monetary/policy-orders',
  '/admin/economy/monetary/certificates/mints',
  '/admin/economy/monetary/mint-certificates',
  '/admin/economy/monetary/certificates/retirements',
];

describe.skipIf(!isolatedUrl)('admin monetary read limits against isolated real PostgreSQL', () => {
  let adminPool: Pool;
  let appPool: Pool;
  let app: INestApplication;
  let allowAdmin = true;

  beforeAll(async () => {
    const url = new URL(isolatedUrl!);
    // Prevent this synthetic schema test from touching a shared dev/production database.
    if (url.hostname !== '127.0.0.1' || url.pathname !== '/mv_b_v609' || Number(url.port) < 1024) {
      throw new Error('isolated v609 PostgreSQL URL required');
    }
    adminPool = new Pool({ connectionString: isolatedUrl });
    await adminPool.query(`
      CREATE ROLE mv_b_v609_app LOGIN PASSWORD 'mv_b_v609_test_only';
      CREATE TABLE public.monetary_regulation_events (id integer, current_ratio numeric, created_at timestamptz);
      CREATE TABLE public.monetary_policy_orders (id integer, created_at timestamptz);
      CREATE TABLE public.mint_certificates (id integer, created_at timestamptz);
      CREATE TABLE public.retirement_certificates (id integer, created_at timestamptz);
      INSERT INTO public.monetary_regulation_events SELECT n, 1.25, now() - n * interval '1 second' FROM generate_series(1,55) n;
      INSERT INTO public.monetary_policy_orders SELECT n, now() - n * interval '1 second' FROM generate_series(1,55) n;
      INSERT INTO public.mint_certificates SELECT n, now() - n * interval '1 second' FROM generate_series(1,55) n;
      INSERT INTO public.retirement_certificates SELECT n, now() - n * interval '1 second' FROM generate_series(1,55) n;
      REVOKE ALL ON public.monetary_regulation_events, public.monetary_policy_orders, public.mint_certificates, public.retirement_certificates FROM PUBLIC;
      GRANT SELECT ON public.monetary_regulation_events, public.monetary_policy_orders, public.mint_certificates, public.retirement_certificates TO mv_b_v609_app;
    `);
    const appUrl = new URL(isolatedUrl);
    appUrl.username = 'mv_b_v609_app';
    appUrl.password = 'mv_b_v609_test_only';
    appPool = new Pool({ connectionString: appUrl.toString() });
    const centralBank = new CentralBankService(appPool as unknown as Queryable);
    const mintBureau = new MintBureauService(appPool as unknown as Queryable);
    const autoRegulation = new AutoMonetaryRegulationService(appPool as unknown as Queryable, centralBank);
    const moduleRef = await Test.createTestingModule({
      controllers: [MonetaryController],
      providers: [
        { provide: CentralBankService, useValue: centralBank },
        { provide: MintBureauService, useValue: mintBureau },
        { provide: AutoMonetaryRegulationService, useValue: autoRegulation },
      ],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard).useValue({ canActivate: () => allowAdmin })
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    await appPool?.end();
    await adminPool?.end();
  });

  for (const path of cases) {
    it(`${path}: uses a bounded SQL read for 1, 20 default, 50`, async () => {
      for (const [suffix, count] of [['?limit=1', 1], ['', 20], ['?limit=50', 50]] as const) {
        const response = await request(app.getHttpServer()).get(`${path}${suffix}`).expect(200);
        expect(response.body).toHaveLength(count);
      }
      await request(app.getHttpServer()).get(`${path}?limit=51`).expect(400);
      await request(app.getHttpServer()).get(`${path}?limit=1e3`).expect(400);
    });
  }

  it('rejects non-admin reads and keeps the application role read-only', async () => {
    allowAdmin = false;
    await request(app.getHttpServer()).get(cases[0]!).expect(403);
    await expect(appPool.query('INSERT INTO public.monetary_policy_orders (id) VALUES (1000)'))
      .rejects.toMatchObject({ code: '42501' });
    expect((await adminPool.query('SELECT count(*)::integer AS n FROM public.monetary_policy_orders')).rows[0]?.n).toBe(55);
  });
});
