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
import { StorageHeadroomController } from './storage-headroom.controller';

const verified = { status: 'VERIFIED', sourceKind: 'HOST_SIGNED', freshness: 'FRESH', observedAt: '2026-10-30T00:00:00.000Z', mounts: [] };

describe('GET /api/v1/admin/operations/storage HTTP auth and privacy', () => {
  let app: INestApplication | undefined;
  async function start(allowed: boolean, fail: boolean) {
    const moduleRef = await Test.createTestingModule({ controllers: [StorageHeadroomController] })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard).useValue({ canActivate: () => allowed })
      .overrideGuard(AdminSessionGuard).useValue({ canActivate: () => true })
      .compile();
    const controller = moduleRef.get(StorageHeadroomController);
    const reader = vi.fn(() => {
      if (fail) throw new Error('/etc/moneyverse/storage-evidence-ed25519-public.pem');
      return verified as never;
    });
    controller.readSnapshot = reader;
    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new ProblemFilter(false));
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
    return reader;
  }
  afterEach(async () => { await app?.close(); app = undefined; });

  it('returns 403 before reading any host evidence for a non-admin', async () => {
    const reader = await start(false, false);
    const response = await request(app!.getHttpServer()).get('/api/v1/admin/operations/storage');
    expect(response.status).toBe(403);
    expect(reader).not.toHaveBeenCalled();
  });
  it('returns private, non-indexable verified evidence only for authorized admin', async () => {
    const reader = await start(true, false);
    const response = await request(app!.getHttpServer()).get('/api/v1/admin/operations/storage');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('VERIFIED');
    expect(response.headers['cache-control']).toContain('no-store');
    expect(response.headers['x-robots-tag']).toContain('noindex');
    expect(reader).toHaveBeenCalledOnce();
  });
  it('returns generic 503 without disclosing private file paths when evidence is absent', async () => {
    await start(true, true);
    const response = await request(app!.getHttpServer()).get('/api/v1/admin/operations/storage');
    expect(response.status).toBe(503);
    expect(response.headers['cache-control']).toContain('no-store');
    expect(JSON.stringify(response.body)).not.toContain('/etc/moneyverse');
    expect(response.body).not.toHaveProperty('mounts');
  });
});
