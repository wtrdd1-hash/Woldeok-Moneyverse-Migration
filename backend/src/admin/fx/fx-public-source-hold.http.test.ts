import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PublicFxController } from './fx.controller';
import { FxService } from './fx.service';
import { SessionGuard } from '../../auth/guards/session.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';

describe('public FX reference HTTP safety contract', () => {
  let app: INestApplication;
  const getReserveStatus = vi.fn().mockResolvedValue({ currentRate: 1352.5 });
  const getForwardRates = vi.fn().mockResolvedValue({ spotRate: 1352.5 });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PublicFxController],
      providers: [{ provide: FxService, useValue: { getReserveStatus, getForwardRates } }],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it.each(['/api/v1/fx/portal', '/api/v1/fx/forward/rates'])(
    'returns 503 with no synthetic values or cache for %s', async (path) => {
      const response = await request(app.getHttpServer()).get(path).expect(503);
      expect(response.body.message).toBe('fx_source_unverified');
      expect(response.headers['cache-control']).toBe('no-store');
      expect(JSON.stringify(response.body)).not.toContain('1352.5');
      expect(getReserveStatus).not.toHaveBeenCalled();
      expect(getForwardRates).not.toHaveBeenCalled();
    },
  );
});
