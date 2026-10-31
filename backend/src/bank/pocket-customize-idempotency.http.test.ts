import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { BankRepository } from './bank.repository';
import { PocketController } from './pocket.controller';

const actor = '11111111-1111-4111-8111-111111111111';
const pocket = '44444444-4444-4444-8444-444444444444';
const key = '33333333-3333-4333-8333-333333333333';

const customizePocket = vi.fn().mockResolvedValue({ pocket_id: pocket, cost_wld: '400' });

describe('bank pocket customization idempotency HTTP boundary', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const builder = Test.createTestingModule({
      controllers: [PocketController],
      providers: [{ provide: BankRepository, useValue: { customizePocket } }],
    });
    for (const guard of [SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard]) {
      builder.overrideGuard(guard).useValue({ canActivate: (context: { switchToHttp: () => { getRequest: () => { session?: unknown } } }) => {
        context.switchToHttp().getRequest().session = { user_id: actor };
        return true;
      } });
    }
    const moduleRef = await builder.compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });
  beforeEach(() => customizePocket.mockClear());
  afterAll(async () => { await app.close(); });

  it('rejects nil, missing and non-v4 keys before the paid repository function', async () => {
    for (const invalid of [undefined, '00000000-0000-0000-0000-000000000000', '33333333-3333-1333-8333-333333333333']) {
      const response = await request(app.getHttpServer())
        .put(`/api/v1/banking/pockets/${pocket}`)
        .send({ themeColor: 'emerald', iconCode: 'wallet', ...(invalid ? { idempotencyKey: invalid } : {}) });
      expect(response.status).toBe(400);
    }
    expect(customizePocket).not.toHaveBeenCalled();
  });

  it('preserves a valid caller key for the authenticated actor and exact pocket', async () => {
    const response = await request(app.getHttpServer())
      .put(`/api/v1/banking/pockets/${pocket}`)
      .send({ themeColor: 'emerald', iconCode: 'wallet', idempotencyKey: key });
    expect(response.status).toBe(200);
    expect(customizePocket).toHaveBeenCalledExactlyOnceWith(key, actor, pocket, 'emerald', 'wallet');
  });
});
