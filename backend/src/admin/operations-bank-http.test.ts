import { VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { ProblemFilter } from '../core/problem.filter';
import { AdminBankOperationsController } from './operations.controller';
import { OperationsRepository } from './operations.repository';

const ACTOR = '00000000-0000-4000-8000-000000000001';

describe('GET /api/v1/admin/bank HTTP evidence contract', () => {
  let app: INestApplication | undefined;

  async function start(fail: 'none' | 'overview' | 'grades' | 'loans') {
    const repository = {
      bankOverview: vi.fn().mockResolvedValue({ deposit_amount: '12345678901234567890' }),
      creditGrades: vi.fn().mockResolvedValue([{ grade: 'A' }]),
      loanBook: vi.fn().mockResolvedValue([{ principal_amount: '23' }]),
    };
    if (fail === 'overview') repository.bankOverview.mockRejectedValueOnce(new Error('DB private'));
    if (fail === 'grades') repository.creditGrades.mockRejectedValueOnce(new Error('DB private'));
    if (fail === 'loans') repository.loanBook.mockRejectedValueOnce(new Error('DB private'));

    const moduleRef = await Test.createTestingModule({
      controllers: [AdminBankOperationsController],
      providers: [{ provide: OperationsRepository, useValue: repository }],
    })
      .overrideGuard(SessionGuard)
      .useValue({
        canActivate: (context: { switchToHttp: () => { getRequest: () => { session?: unknown } } }) => {
          context.switchToHttp().getRequest().session = { user_id: ACTOR };
          return true;
        },
      })
      .overrideGuard(AuthenticatedGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AdminSessionGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new ProblemFilter(false));
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
    return repository;
  }

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  it.each([
    '', ' ', '2junk', '1e2', '1.5', '0x10', '0', '-1', '201',
    '9007199254740993', '01', '+2', 'Infinity', 'NaN',
  ])('rejects non-canonical loan limit %j before any bank query', async (invalid) => {
    const repository = await start('none');
    const response = await request(app!.getHttpServer())
      .get('/api/v1/admin/bank')
      .query({ limit: invalid });
    expect(response.status).toBe(400);
    expect(repository.bankOverview).not.toHaveBeenCalled();
    expect(repository.creditGrades).not.toHaveBeenCalled();
    expect(repository.loanBook).not.toHaveBeenCalled();
  });

  it('rejects duplicate loan limits before any bank query', async () => {
    const repository = await start('none');
    const response = await request(app!.getHttpServer()).get('/api/v1/admin/bank?limit=2&limit=2');
    expect(response.status).toBe(400);
    expect(repository.loanBook).not.toHaveBeenCalled();
  });

  it.each(['1', '200'])('accepts canonical boundary loan limit %s', async (valid) => {
    const repository = await start('none');
    const response = await request(app!.getHttpServer()).get('/api/v1/admin/bank').query({ limit: valid });
    expect(response.status).toBe(200);
    expect(repository.loanBook).toHaveBeenCalledWith(ACTOR, Number(valid));
  });

  it('returns complete authoritative bank data on success', async () => {
    await start('none');
    const response = await request(app!.getHttpServer()).get('/api/v1/admin/bank');
    expect(response.status).toBe(200);
    expect(response.body.overview.deposit_amount).toBe('12345678901234567890');
    expect(response.body.grades).toHaveLength(1);
    expect(response.body.loans).toHaveLength(1);
  });

  it.each(['overview', 'grades', 'loans'] as const)(
    'returns 503 and no fabricated financial data if %s read fails',
    async (failed) => {
      await start(failed);
      const response = await request(app!.getHttpServer()).get('/api/v1/admin/bank');
      expect(response.status).toBe(503);
      expect(response.body).not.toHaveProperty('overview');
      expect(response.body).not.toHaveProperty('grades');
      expect(response.body).not.toHaveProperty('loans');
      expect(JSON.stringify(response.body)).not.toContain('DB private');
    },
  );
});
