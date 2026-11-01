import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import type { ExecutionContext, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionRepository } from '../auth/session.repository';
import { PG_POOL } from '../core/pool.provider';
import { BurnEventController } from './burn-event.controller';

const query = vi.fn().mockResolvedValue({ rows: [{ participate_anti_inflation_burn_draw: { success: true } }] });
const verifyCsrf = vi.fn().mockImplementation(async (_id: string, token: string) => token === 'valid-token');
const hasCurrentUserConsent = vi.fn().mockResolvedValue(true);

describe('P0 burn draw must not bypass canonical economy ledger', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [BurnEventController],
      providers: [
        { provide: PG_POOL, useValue: { query } },
        { provide: SessionRepository, useValue: { verifyCsrf, hasCurrentUserConsent } },
        CsrfGuard, ConsentGuard,
      ],
    })
      .overrideGuard(SessionGuard).useValue({
        canActivate: (context: ExecutionContext) => {
          context.switchToHttp().getRequest().session = {
            id: 'session-1', user_id: '11111111-1111-4111-8111-111111111111',
          };
          return true;
        },
      })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .compile();
    app = testingModule.createNestApplication();
    await app.init();
  });
  afterAll(async () => { await app?.close(); });
  beforeEach(() => { query.mockClear(); verifyCsrf.mockClear(); hasCurrentUserConsent.mockResolvedValue(true); });

  it('rejects even authenticated, consented, CSRF-valid burn requests with 503 and no SQL call', async () => {
    const response = await request(app.getHttpServer())
      .post('/economy/events/burn-draw/participate')
      .set('x-csrf-token', 'valid-token')
      .send({ burnAmount: '10000' }).expect(503);
    expect(response.body.code).toBe('BURN_DRAW_LEDGER_UNAVAILABLE');
    expect(response.body).not.toHaveProperty('success', true);
    expect(query).not.toHaveBeenCalled();
  });

  it('rejects a missing CSRF token before any financial mutation', async () => {
    await request(app.getHttpServer())
      .post('/economy/events/burn-draw/participate')
      .send({ burnAmount: '10000' }).expect(403);
    expect(query).not.toHaveBeenCalled();
  });
});
