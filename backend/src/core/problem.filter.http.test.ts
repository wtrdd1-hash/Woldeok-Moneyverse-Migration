import { Controller, ForbiddenException, Get, Module, NotFoundException, UnauthorizedException } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { securityHeaders } from '../security/security-headers.middleware';
import { ProblemFilter } from './problem.filter';

@Controller('problem-test')
class ProblemTestController {
  @Get('unauthorized') unauthorized(): never { throw new UnauthorizedException('login required'); }
  @Get('forbidden') forbidden(): never { throw new ForbiddenException('no access'); }
  @Get('missing') missing(): never { throw new NotFoundException('missing'); }
}

@Module({ controllers: [ProblemTestController] })
class ProblemTestModule {}

describe('ProblemFilter HTTP authorization privacy', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [ProblemTestModule] }).compile();
    app = moduleRef.createNestApplication();
    app.use(securityHeaders({ isProduction: true }));
    app.useGlobalFilters(new ProblemFilter(true));
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it.each([
    ['unauthorized', 401],
    ['forbidden', 403],
  ] as const)('returns private non-indexable HTTP denial for %s (%i)', async (path, code) => {
    const response = await request(app.getHttpServer()).get(`/problem-test/${path}`);
    expect(response.status).toBe(code);
    expect(response.headers['cache-control']).toBe('private, no-store');
    expect(response.headers['x-robots-tag']).toBe('noindex');
    expect(response.headers['referrer-policy']).toBe('no-referrer');
    expect(response.headers['content-type']).toMatch(/application\/problem\+json/);
  });

  it('does not reclassify an unrelated public 404', async () => {
    const response = await request(app.getHttpServer()).get('/problem-test/missing');
    expect(response.status).toBe(404);
    expect(response.headers['cache-control']).toBeUndefined();
    expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  });
});
