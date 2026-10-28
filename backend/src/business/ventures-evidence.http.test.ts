import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { VenturesController } from './ventures.controller';

const actor = '11111111-1111-4111-8111-111111111111';

describe('venture finance evidence HTTP contract', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ controllers: [VenturesController] })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .compile();
    app = moduleRef.createNestApplication();
    app.use((req: { session?: unknown }, _res: unknown, next: () => void) => {
      req.session = { user_id: actor };
      next();
    });
    await app.init();
  });

  afterAll(async () => { await app?.close(); });

  it('does not report invented funding pitches or investor totals as verified HTTP data', async () => {
    const response = await request(app.getHttpServer()).get('/businesses/ventures/pitches').expect(503);
    expect(response.body.code).toBe('VENTURE_EVIDENCE_UNAVAILABLE');
    expect(response.headers['cache-control']).toContain('no-store');
    expect(JSON.stringify(response.body)).not.toContain('pitch-ai-01');
  });

  it('does not publish fictitious member equity or claimable dividends over HTTP', async () => {
    const response = await request(app.getHttpServer()).get('/businesses/ventures/investments').expect(503);
    expect(response.body.code).toBe('VENTURE_EVIDENCE_UNAVAILABLE');
    expect(response.headers['cache-control']).toContain('no-store');
    expect(JSON.stringify(response.body)).not.toContain('48500');
  });
});
