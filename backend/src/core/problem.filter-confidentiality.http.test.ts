import { Controller, Get, HttpException } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ProblemFilter } from './problem.filter';

@Controller('problem-filter-confidentiality')
class ConfidentialityFixtureController {
  @Get('internal')
  internal(): never {
    throw new HttpException(
      { message: 'database URL: private-secret', code: 'private-secret' },
      500,
    );
  }

  @Get('unavailable')
  unavailable(): never {
    throw new HttpException(
      { message: 'temporarily unavailable', code: 'SOURCE_UNAVAILABLE' },
      503,
    );
  }
}

describe('production problem response confidentiality at the Nest HTTP boundary', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ConfidentialityFixtureController],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new ProblemFilter(true));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('redacts explicit 500 diagnostics in the actual JSON response', async () => {
    const response = await request(app.getHttpServer()).get(
      '/problem-filter-confidentiality/internal',
    );
    expect(response.status).toBe(500);
    expect(response.headers['content-type']).toContain('application/problem+json');
    expect(response.body).toEqual({
      type: 'about:blank',
      title: 'Internal Server Error',
      status: 500,
      detail: 'internal server error',
    });
    expect(response.text).not.toContain('private-secret');
  });

  it('preserves the existing 503 machine-readable refusal code', async () => {
    const response = await request(app.getHttpServer()).get(
      '/problem-filter-confidentiality/unavailable',
    );
    expect(response.status).toBe(503);
    expect(response.body.code).toBe('SOURCE_UNAVAILABLE');
  });
});
