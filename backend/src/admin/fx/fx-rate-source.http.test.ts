import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Pool } from 'pg';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SessionGuard } from '../../auth/guards/session.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { PublicFxController } from './fx.controller';
import { FxRepository } from './fx.repository';
import { FxService } from './fx.service';

describe('public FX HTTP source fail-closed', () => {
  let app: INestApplication | undefined;
  afterEach(async () => { await app?.close(); });

  it('returns HTTP 503 rather than a fabricated spot quote when the reserve source is absent', async () => {
    const pool = { query: vi.fn().mockResolvedValue({ rows: [] }) } as unknown as Pool;
    const repo = new FxRepository(pool);
    const testingModule = await Test.createTestingModule({
      controllers: [PublicFxController],
      providers: [{ provide: FxService, useValue: new FxService(repo) }],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .compile();
    app = testingModule.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
    const response = await request(app.getHttpServer()).get('/api/v1/fx/portal');
    expect(response.status).toBe(503);
    expect(response.body.success).not.toBe(true);
    expect(JSON.stringify(response.body)).not.toContain('1350');
  });
});
