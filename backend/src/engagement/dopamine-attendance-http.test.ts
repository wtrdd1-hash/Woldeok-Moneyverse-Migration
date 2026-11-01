import 'reflect-metadata';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { DopamineController } from './dopamine.controller';
import { DopamineRepository } from './dopamine.repository';

describe('P0 attendance authenticated HTTP containment', () => {
  let app: INestApplication;
  const getAttendanceStatus = vi.fn();
  const claimAttendanceSpin = vi.fn();
  beforeAll(async () => {
    const builder = Test.createTestingModule({
      controllers: [DopamineController],
      providers: [{ provide: DopamineRepository, useValue: { getAttendanceStatus, claimAttendanceSpin } }],
    });
    for (const guard of [SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard]) {
      builder.overrideGuard(guard).useValue({ canActivate: () => true });
    }
    const moduleRef = await builder.compile();
    app = moduleRef.createNestApplication();
    app.use((req: { session?: unknown }, _res: unknown, next: () => void) => {
      req.session = { user_id: '11111111-2222-4333-8444-555555555555' };
      next();
    });
    app.setGlobalPrefix('api/v1');
    await app.init();
  });
  afterAll(async () => app?.close());

  for (const path of ['attendance/status', 'attendance/spin'] as const) {
    it(`refuses ${path} without a fabricated WLD reward`, async () => {
      const url = `/api/v1/engagement/dopamine/${path}`;
      const response = path.endsWith('/spin')
        ? await request(app.getHttpServer()).post(url).send({ idempotencyKey: '11111111-2222-4333-8444-555555555556' })
        : await request(app.getHttpServer()).get(url);
      expect(response.status).toBe(503);
      expect(response.body).toMatchObject({
        code: path.endsWith('/spin') ? 'ATTENDANCE_SETTLEMENT_UNAVAILABLE' : 'ATTENDANCE_EVIDENCE_UNAVAILABLE',
      });
      expect(response.headers['cache-control']).toBe('private, no-store');
      expect(response.headers['x-robots-tag']).toBe('noindex');
      expect(response.headers['referrer-policy']).toBe('no-referrer');
      expect(response.body).not.toHaveProperty('success', true);
      expect(response.body).not.toHaveProperty('rewardAmount');
      expect(response.body).not.toHaveProperty('newBalance');
    });
  }

  it('never calls the unsafe attendance SQL path', () => {
    expect(getAttendanceStatus).not.toHaveBeenCalled();
    expect(claimAttendanceSpin).not.toHaveBeenCalled();
  });
});
