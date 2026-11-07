import { ForbiddenException } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { SeoController } from './seo.controller';
import { SeoService } from './seo.service';
import { SeoCrawlerAuditService } from './seo-crawler-audit.service';
import { SeoDailyDigestService } from './seo-daily-digest.service';
import { TwitterPublisherService } from './twitter-publisher.service';

describe('SEO manual X publishing HTTP authority', () => {
  let app: INestApplication;
  let adminOpen = true;
  const publishTweet = vi.fn().mockResolvedValue({ success: true, configured: true, tweetId: 'test-id' });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SeoController],
      providers: [
        { provide: SeoService, useValue: {} },
        { provide: SeoCrawlerAuditService, useValue: {} },
        { provide: SeoDailyDigestService, useValue: {} },
        { provide: TwitterPublisherService, useValue: { publishTweet } },
      ],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard).useValue({ canActivate: () => true })
      .overrideGuard(AdminSessionGuard).useValue({ canActivate: () => {
        if (!adminOpen) throw new ForbiddenException('admin console required');
        return true;
      } })
      .overrideGuard(CsrfGuard).useValue({ canActivate: (ctx: { switchToHttp: () => { getRequest: () => { headers: Record<string, string | undefined> } } }) => {
        if (ctx.switchToHttp().getRequest().headers['x-csrf-token'] !== 'valid') {
          throw new ForbiddenException('csrf token required');
        }
        return true;
      } })
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app?.close(); });
  beforeEach(() => { vi.clearAllMocks(); adminOpen = true; });

  it('rejects a missing CSRF token before publishing externally', async () => {
    await request(app.getHttpServer()).post('/seo/twitter/test-tweet').send({ text: 'test' }).expect(403);
    expect(publishTweet).not.toHaveBeenCalled();
  });

  it('rejects a forged CSRF token before publishing externally', async () => {
    await request(app.getHttpServer()).post('/seo/twitter/test-tweet')
      .set('x-csrf-token', 'forged').send({ text: 'test' }).expect(403);
    expect(publishTweet).not.toHaveBeenCalled();
  });

  it('requires an open administrator console even with valid CSRF', async () => {
    adminOpen = false;
    await request(app.getHttpServer()).post('/seo/twitter/test-tweet')
      .set('x-csrf-token', 'valid').send({ text: 'test' }).expect(403);
    expect(publishTweet).not.toHaveBeenCalled();
  });

  it('preserves the verified administrator response contract', async () => {
    const result = await request(app.getHttpServer()).post('/seo/twitter/test-tweet')
      .set('x-csrf-token', 'valid').send({ text: 'test' }).expect(200);
    expect(result.body).toEqual({ success: true, configured: true, tweetId: 'test-id' });
    expect(publishTweet).toHaveBeenCalledExactlyOnceWith('test');
  });
});
