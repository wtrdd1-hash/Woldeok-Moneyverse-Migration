import { Test } from '@nestjs/testing';
import { beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from './app.module';
import { buildOpenApiDocument } from './openapi';

describe('buildOpenApiDocument', () => {
  let document: ReturnType<typeof buildOpenApiDocument>;

  beforeAll(async () => {
    process.env.APP_BASE_URL = 'http://127.0.0.1:3000';
    process.env.INTERNAL_API_TOKEN = 'x'.repeat(32);
    delete process.env.DATABASE_URL;
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    const app = moduleRef.createNestApplication();
    await app.init();
    document = buildOpenApiDocument(app);
    await app.close();
  }, 30000);

  it('names the service', () => {
    expect(document.info.title).toBe('Woldeok Moneyverse API');
  });

  it('describes the health endpoint', () => {
    expect(document.paths['/health']?.get).toBeDefined();
  });

  it('publishes the versioned API base for generated app clients', () => {
    expect(document.servers).toEqual([{ url: '/api/v1', description: 'Version 1' }]);
  });

  it('declares both header credentials the API accepts', () => {
    const schemes = document.components?.securitySchemes ?? {};
    expect(Object.keys(schemes).sort()).toEqual(['csrf-token', 'internal-token']);
  });
});
