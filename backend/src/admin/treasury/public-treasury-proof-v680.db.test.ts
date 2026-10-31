import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Client } from 'pg';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PublicTreasuryController } from './treasury.controller';
import { TreasuryRepository } from './treasury.repository';
import { TreasuryService } from './treasury.service';

const raw = process.env.MV_B_V680_DATABASE_URL;
const url = raw ? new URL(raw) : null;
const isolated = url?.hostname === '127.0.0.1' && url.port === '55480' &&
  url.pathname === '/mv_b_v680_evidence';

describe.runIf(isolated)('P0 treasury public proof on disposable PostgreSQL 17', () => {
  let client: Client;
  let app: INestApplication;

  beforeAll(async () => {
    client = new Client({ connectionString: raw });
    await client.connect();
    const identity = await client.query('SELECT current_database() AS db, current_user AS actor');
    expect(identity.rows[0]).toMatchObject({ db: 'mv_b_v680_evidence', actor: 'moneyverse_app' });
    const repository = new TreasuryRepository(client);
    const testingModule = await Test.createTestingModule({
      controllers: [PublicTreasuryController],
      providers: [{ provide: TreasuryService, useValue: new TreasuryService(repository) }],
    }).compile();
    app = testingModule.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
    if (client) await client.end();
  });

  it('never returns a success-shaped WLD balance without a reconciled journal', async () => {
    const response = await request(app.getHttpServer()).get('/treasury/public-overview');
    expect(response.status).toBe(503);
    expect(response.headers['cache-control']).toContain('no-store');
    expect(response.body).not.toHaveProperty('success', true);
    expect(response.body).not.toHaveProperty('total_treasury_wld');
    expect(response.body).not.toHaveProperty('vaults');
  });
});
