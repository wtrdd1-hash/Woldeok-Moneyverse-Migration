import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import type { ExecutionContext, INestApplication } from '@nestjs/common';
import { UnauthorizedException, VersioningType } from '@nestjs/common';
import request from 'supertest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { DopamineController } from './dopamine.controller';
import { DopamineRepository } from './dopamine.repository';

describe('Dopamine quota status HTTP contract', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [DopamineController],
      providers: [{ provide: DopamineRepository, useValue: null }],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: (ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        if (req.headers['x-test-owner'] !== '1') throw new UnauthorizedException('login required');
        req.session = { user_id: '11111111-2222-4333-8444-555555555555' };
        return true;
      } })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(CsrfGuard).useValue({ canActivate: () => true })
      .compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it('returns private HTTP 503 instead of invented owner quotas', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/engagement/dopamine/status').set('x-test-owner', '1').expect(503);
    expect(response.body).toMatchObject({ code: 'DOPAMINE_QUOTA_UNVERIFIED' });
    expect(response.body).not.toHaveProperty('dailyShowdownsRemaining');
    expect(response.body).not.toHaveProperty('starDropRemaining');
    expect(response.headers['cache-control']).toBe('private, no-store');
    expect(response.headers['x-robots-tag']).toBe('noindex, nofollow');
  });

  it('keeps anonymous callers unauthenticated', async () => {
    await request(app.getHttpServer()).get('/api/v1/engagement/dopamine/status').expect(401);
  });
});
