import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import type { INestApplication, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { BankRepository } from './bank.repository';
import { PocketController } from './pocket.controller';

const actor = '11111111-1111-4111-8111-111111111111';
const pocket = '44444444-4444-4444-8444-444444444444';
const key = '33333333-3333-4333-8333-333333333333';
const query = vi.fn().mockResolvedValue({ rows: [{ cost_wld: '100' }] });

describe('P0 bank pocket fee hold — real Nest HTTP route, no financial SQL', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const builder = Test.createTestingModule({
      controllers: [PocketController],
      providers: [{ provide: BankRepository, useValue: new BankRepository({ query } as unknown as Queryable) }],
    });
    for (const guard of [SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard]) {
      builder.overrideGuard(guard).useValue({
        canActivate: (context: ExecutionContext) => {
          context.switchToHttp().getRequest().session = { user_id: actor };
          return true;
        },
      });
    }
    const moduleRef = await builder.compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it.each([['sky', 'piggy-bank'], ['rose', 'heart']])(
    'responds 503 before money SQL for %s/%s, never claims success', async (themeColor, iconCode) => {
      query.mockClear();
      const response = await request(app.getHttpServer())
        .put(`/api/v1/banking/pockets/${pocket}`)
        .send({ idempotencyKey: key, themeColor, iconCode });
      expect(response.status).toBe(503);
      expect(response.body.message).toMatch(/temporarily unavailable/);
      expect(response.body).not.toHaveProperty('cost_wld');
      expect(query).not.toHaveBeenCalled();
    },
  );

  it('still rejects an invalid key as 400 without touching money SQL', async () => {
    query.mockClear();
    await request(app.getHttpServer())
      .put(`/api/v1/banking/pockets/${pocket}`)
      .send({ idempotencyKey: '00000000-0000-0000-0000-000000000000', themeColor: 'rose' })
      .expect(400);
    expect(query).not.toHaveBeenCalled();
  });
});
