import { Test } from '@nestjs/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { AppModule } from './app.module';
import { buildOpenApiDocument } from './openapi';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

async function documentOf() {
  process.env.APP_BASE_URL = 'http://127.0.0.1:3000';
  process.env.INTERNAL_API_TOKEN = 'x'.repeat(32);
  delete process.env.DATABASE_URL;
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  await app.init();
  const document = buildOpenApiDocument(app);
  await app.close();
  return document;
}

describe('buildOpenApiDocument', () => {
  it('names the service', async () => {
    expect((await documentOf()).info.title).toBe('Woldeok Moneyverse API');
  });

  it('describes the health endpoint', async () => {
    const document = await documentOf();
    expect(document.paths['/health']?.get).toBeDefined();
  });

  it('publishes the versioned API base for generated app clients', async () => {
    const document = await documentOf();
    expect(document.servers).toEqual([{ url: '/api/v1', description: 'Version 1' }]);
  });

  it('declares both header credentials the API accepts', async () => {
    const schemes = (await documentOf()).components?.securitySchemes ?? {};
    expect(Object.keys(schemes).sort()).toEqual(['csrf-token', 'internal-token']);
  });
});
