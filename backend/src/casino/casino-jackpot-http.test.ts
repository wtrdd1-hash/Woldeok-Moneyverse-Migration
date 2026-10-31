import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { CasinoController } from './casino.controller';
import { CasinoRepository } from './casino.repository';
import { CasinoJackpotProofUnavailableError } from './casino.repository';

describe('P0 #2077 jackpot HTTP contract', () => {
  let app: INestApplication;
  const jackpotPool = vi.fn().mockRejectedValue(new CasinoJackpotProofUnavailableError());

  beforeAll(async () => {
    const builder = Test.createTestingModule({
      controllers: [CasinoController],
      providers: [{ provide: CasinoRepository, useValue: { jackpotPool } }],
    });
    for (const guard of [SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard]) {
      builder.overrideGuard(guard).useValue({ canActivate: () => true });
    }
    const moduleRef = await builder.compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app?.close(); });

  it('returns 503 with a stable code and no fabricated WLD amount', async () => {
    const response = await request(app.getHttpServer()).get('/casino/jackpot');
    expect(response.status).toBe(503);
    expect(response.body.code).toBe('jackpot_proof_unavailable');
    expect(JSON.stringify(response.body)).not.toMatch(/74500000|12845000|jackpot_amount|house_reserve/);
    expect(jackpotPool).toHaveBeenCalledTimes(1);
  });
});
