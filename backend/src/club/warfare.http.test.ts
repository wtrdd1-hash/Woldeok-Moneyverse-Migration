import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { WarfareController } from './warfare.controller';

describe('Warfare HTTP finance evidence boundary', () => {
  let app: INestApplication;
  let authenticated = true;

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({ controllers: [WarfareController] })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => authenticated })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .compile();
    app = testingModule.createNestApplication();
    app.use((req: { session?: unknown }, _res: unknown, next: () => void) => {
      req.session = { user_id: '11111111-2222-4333-8444-555555555555' };
      next();
    });
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it('returns non-cacheable 503 without fictional owner, season, or tax receipts', async () => {
    for (const path of ['/clubs/warfare/strongholds', '/clubs/warfare/status']) {
      const response = await request(app.getHttpServer()).get(path).expect(503);
      expect(response.headers['cache-control']).toBe('no-store');
      expect(JSON.stringify(response.body)).not.toMatch(/1250000|4200000|club-valhalla|seasonEndsAt/);
    }
  });

  it('rejects financial mutation before a client can claim success', async () => {
    const response = await request(app.getHttpServer())
      .post('/clubs/warfare/claim-tax')
      .send({ strongholdId: 'stronghold-central-bank', idempotencyKey: 'd1b2c3d4-e5f6-7890-abcd-ef1234567892' })
      .expect(503);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(JSON.stringify(response.body)).not.toMatch(/success|payout|receipt/);
  });

  it('preserves authenticated-only boundary', async () => {
    authenticated = false;
    try { await request(app.getHttpServer()).get('/clubs/warfare/status').expect(403); }
    finally { authenticated = true; }
  });
});
