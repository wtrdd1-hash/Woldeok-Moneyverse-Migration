import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { AiNewsController } from './ai-news.controller';
import { AiNewsService } from './ai-news.service';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const SCENARIO = '22222222-2222-4222-8222-222222222222';

function pgFailure(code: string, message: string): Error & { code: string } {
  return Object.assign(new Error(message), { code });
}

describe('AI news HTTP database error privacy', () => {
  let app: INestApplication;
  const publish = vi.fn();

  beforeAll(async () => {
    const builder = Test.createTestingModule({
      controllers: [AiNewsController],
      providers: [{ provide: AiNewsService, useValue: { publish } }],
    });
    for (const guard of [SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard, CsrfGuard]) {
      builder.overrideGuard(guard).useValue({ canActivate: () => true });
    }
    const moduleRef = await builder.compile();
    app = moduleRef.createNestApplication();
    app.use((req: { session?: unknown }, _res: unknown, next: () => void) => {
      req.session = { user_id: ACTOR };
      next();
    });
    await app.init();
  });

  afterAll(async () => { await app?.close(); });

  async function postPublish() {
    return request(app.getHttpServer())
      .post(`/admin/ai-news/scenarios/${SCENARIO}/publish`)
      .send({ hours: 6, headline: 'Market update', effects: [{ direction: 'up', strength: 1 }] });
  }

  it('does not expose raw SQL or connection details through serialized HTTP errors', async () => {
    const secret = 'postgres://admin:secret@internal-db.example/users';
    publish.mockRejectedValueOnce(pgFailure('23505', `constraint failure ${secret}`));
    const response = await postPublish();
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ code: 'ai_news_refused', message: 'this scenario cannot be published' });
    expect(response.body).not.toHaveProperty('detail');
    expect(JSON.stringify(response.body)).not.toContain(secret);
  });

  it('retains the safe reversal classification through HTTP', async () => {
    publish.mockRejectedValueOnce(pgFailure('22023', 'a strong reversal cannot follow the opposite news within six hours'));
    const response = await postPublish();
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ code: 'ai_news_refused', detail: 'reversal' });
  });
});
