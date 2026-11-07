import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import type { ExecutionContext, INestApplication } from '@nestjs/common';
import { Pool } from 'pg';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { BankRepository } from './bank.repository';
import { PocketController } from './pocket.controller';

const url = process.env.ISOLATED_POCKET_DATABASE_URL;
const ownerUrl = process.env.ISOLATED_POCKET_MIGRATOR_URL;
const disposable = (value: string | undefined, user: string) => {
  if (!value) return false;
  const parsed = new URL(value);
  return parsed.hostname === '127.0.0.1' && parsed.pathname === '/woldeok_moneyverse_dev' &&
    parsed.username === user && Number(parsed.port) > 0;
};
const allowed = disposable(url, 'moneyverse_app') && disposable(ownerUrl, 'postgres');
const actorA = '11111111-1111-4111-8111-111111111111';
const actorB = '22222222-2222-4222-8222-222222222222';
const pocketA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const pocketB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

describe.skipIf(!allowed)('real PostgreSQL + Nest authenticated owner pocket read', () => {
  let app: INestApplication;
  let admin: Pool;
  let client: Pool;
  let actor = actorA;

  beforeAll(async () => {
    admin = new Pool({ connectionString: ownerUrl });
    client = new Pool({ connectionString: url });
    await admin.query('INSERT INTO public.users(id) VALUES ($1), ($2)', [actorA, actorB]);
    await admin.query(
      `INSERT INTO public.bank_saving_pockets(id,user_id,name,balance)
       VALUES ($1,$2,'A owner pocket',9007199254740993), ($3,$4,'B owner pocket',7)`,
      [pocketA, actorA, pocketB, actorB],
    );
    const builder = Test.createTestingModule({
      controllers: [PocketController],
      providers: [{ provide: BankRepository, useValue: new BankRepository(client) }],
    });
    for (const guard of [SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard]) {
      builder.overrideGuard(guard).useValue({
        canActivate: (ctx: ExecutionContext) => {
          ctx.switchToHttp().getRequest().session = { user_id: actor };
          return true;
        },
      });
    }
    const moduleRef = await builder.compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    if (admin) {
      await admin.query('DELETE FROM public.bank_saving_pockets WHERE id = ANY($1::uuid[])', [[pocketA, pocketB]]);
      await admin.query('DELETE FROM public.users WHERE id = ANY($1::uuid[])', [[actorA, actorB]]);
      await admin.end();
    }
    await client?.end();
  });

  it('returns only the session owner row, preserving 64-bit WLD exactly', async () => {
    actor = actorA;
    const first = await request(app.getHttpServer()).get('/api/v1/banking/pockets').expect(200);
    expect(first.body).toHaveLength(1);
    expect(first.body[0].name).toBe('A owner pocket');
    expect(first.body[0].balance).toBe('9007199254740993');
    actor = actorB;
    const second = await request(app.getHttpServer()).get('/api/v1/banking/pockets').expect(200);
    expect(second.body).toHaveLength(1);
    expect(second.body[0].name).toBe('B owner pocket');
  });

  it('denies direct pocket table SELECT to the runtime app role', async () => {
    await expect(client.query('SELECT * FROM public.bank_saving_pockets')).rejects.toMatchObject({ code: '42501' });
  });
});
