import 'reflect-metadata';
import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { SessionRepository } from '../auth/session.repository';
import { CONFIG } from '../core/config';
import { DeokiAdvisorController } from './deoki-advisor.controller';
import { DeokiAdvisorRepository } from './deoki-advisor.repository';

const ACTOR = '11111111-1111-4111-8111-111111111111';

describe('Deoki advisor HTTP security boundary', () => {
  let app: INestApplication;
  const diagnose = vi.fn();
  const ask = vi.fn();
  const consent = vi.fn().mockResolvedValue(true);
  const csrf = vi.fn().mockResolvedValue(true);

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [DeokiAdvisorController],
      providers: [
        { provide: DeokiAdvisorRepository, useValue: { diagnoseUserPortfolio: diagnose, askDeoki: ask } },
        { provide: SessionRepository, useValue: { hasCurrentUserConsent: consent, verifyCsrf: csrf } },
        { provide: CONFIG, useValue: {} },
        AuthenticatedGuard, ConsentGuard, CsrfGuard,
      ],
    }).overrideGuard(SessionGuard).useValue({ canActivate(context: { switchToHttp: () => { getRequest: () => Record<string, unknown> } }) {
      const req = context.switchToHttp().getRequest();
      if (req.headers && (req.headers as Record<string, string>)['x-test-session'] === 'owner') {
        req.session = { id: 'session-1', user_id: ACTOR };
        return true;
      }
      throw new UnauthorizedException('login required');
    } }).compile();
    app = testingModule.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app?.close(); });

  it('denies guest GET and POST before any portfolio read', async () => {
    await request(app.getHttpServer()).get('/advisor/deoki/diagnose').expect(401);
    await request(app.getHttpServer()).post('/advisor/deoki/ask').send({ question: 'risk' }).expect(401);
    expect(diagnose).not.toHaveBeenCalled();
    expect(ask).not.toHaveBeenCalled();
  });

  it('denies POST without a CSRF token after authenticated consent', async () => {
    await request(app.getHttpServer()).post('/advisor/deoki/ask')
      .set('x-test-session', 'owner').send({ question: 'risk' }).expect(403);
    expect(ask).not.toHaveBeenCalled();
  });

  it('does not disclose SQL error messages through the HTTP response', async () => {
    diagnose.mockRejectedValueOnce(new Error('private SQL 42501 permission denied'));
    const response = await request(app.getHttpServer()).get('/advisor/deoki/diagnose')
      .set('x-test-session', 'owner').expect(503);
    expect(response.text).not.toContain('42501');
    expect(response.text).not.toContain('permission denied');
    expect(diagnose).toHaveBeenCalledWith(ACTOR);
  });

  it('binds valid POST to session actor, current consent and CSRF', async () => {
    ask.mockResolvedValueOnce({ answer: 'verified', tips: [] });
    const response = await request(app.getHttpServer()).post('/advisor/deoki/ask')
      .set('x-test-session', 'owner').set('x-csrf-token', 'session-csrf')
      .send({ question: 'risk' }).expect(201);
    expect(response.body).toMatchObject({ success: true, answer: 'verified' });
    expect(ask).toHaveBeenCalledWith(ACTOR, 'risk');
    expect(csrf).toHaveBeenCalledWith('session-1', 'session-csrf');
  });
});
