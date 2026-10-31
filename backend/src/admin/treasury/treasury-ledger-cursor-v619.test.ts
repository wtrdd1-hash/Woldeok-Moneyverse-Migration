import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { BadRequestException, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { Queryable } from '../../core/db';
import { SessionGuard } from '../../auth/guards/session.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { AdminTreasuryController } from './treasury.controller';
import { TreasuryRepository } from './treasury.repository';
import { TreasuryService } from './treasury.service';
import { AutoSovereignWealthFundService } from './auto-swf.service';

const AT = '2026-10-28 14:23:45.123456+00';
const NEWER = '00000000-0000-4000-8000-000000000099';
const OLDER = '00000000-0000-4000-8000-000000000098';
const row = (id: string) => ({
  id, cursor_created_at: AT, created_at: new Date('2026-10-28T14:23:45.123Z'),
  vault_id: '00000000-0000-4000-8000-000000000001', vault_code: 'VAULT_MAIN',
  vault_name: 'Main', tx_type: 'INJECTION', amount_wld: '9007199254740993',
  actor_id: null, actor_name: 'SYSTEM', reason: 'Test ledger audit entry',
  balance_before: '0', balance_after: '9007199254740993',
});
const fixture = (rows: ReturnType<typeof row>[]) => {
  const query = vi.fn().mockResolvedValue({ rows });
  return { repo: new TreasuryRepository({ query } as unknown as Queryable), query };
};

describe('P1 treasury ledger stable audit cursor', () => {
  it('retains microsecond precision and the UUID tie-breaker across same-time rows', async () => {
    const { repo, query } = fixture([row(NEWER), row(OLDER)]);
    const first = await repo.listTransactions(1);
    expect(first.items.map(x => x.id)).toEqual([NEWER]);
    expect(first.next_cursor).toMatch(/^tl1\.[A-Za-z0-9_-]+$/);
    const data = JSON.parse(Buffer.from(first.next_cursor!.slice(4), 'base64url').toString('utf8'));
    expect(data).toEqual({ at: AT, id: NEWER });
    const sql = query.mock.calls[0]?.[0] as string;
    expect(sql).toContain('l.created_at::text AS cursor_created_at');
    expect(sql).toContain('ORDER BY l.created_at DESC, l.id DESC');
    expect(query.mock.calls[0]?.[1]).toEqual([2]);

    const next = fixture([row(OLDER)]);
    await next.repo.listTransactions(1, first.next_cursor!);
    const nextSql = next.query.mock.calls[0]?.[0] as string;
    expect(nextSql).toMatch(/\(l\.created_at, l\.id\)\s*<\s*\(\$1::timestamptz, \$2::uuid\)/);
    expect(next.query.mock.calls[0]?.[1]).toEqual([AT, NEWER, 2]);
  });

  it('rejects malformed limit and cursor before any database access', async () => {
    const { repo, query } = fixture([]);
    for (const value of [0, -1, 1.5, NaN, Infinity, 101, '2junk', '02', '1e2', ['1', '2']]) {
      await expect(repo.listTransactions(value as number)).rejects.toBeInstanceOf(BadRequestException);
    }
    for (const cursor of ['2026-10-28T14:23:45Z', 'tl1.invalid', 'tl1.' + 'a'.repeat(500)]) {
      await expect(repo.listTransactions(20, cursor)).rejects.toBeInstanceOf(BadRequestException);
    }
    expect(query).not.toHaveBeenCalled();
  });
});

describe('P1 treasury ledger HTTP input contract', () => {
  let app: INestApplication;
  const listTransactions = vi.fn().mockResolvedValue({ items: [], next_cursor: null });
  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      controllers: [AdminTreasuryController],
      providers: [
        { provide: TreasuryService, useValue: { listTransactions } },
        { provide: AutoSovereignWealthFundService, useValue: {} },
      ],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard).useValue({ canActivate: () => true })
      .overrideGuard(CsrfGuard).useValue({ canActivate: () => true })
      .compile();
    app = mod.createNestApplication();
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it('returns 400 without touching the service for invalid or repeated pagination', async () => {
    listTransactions.mockClear();
    for (const suffix of ['?limit=', '?limit=0', '?limit=101', '?limit=2junk',
      '?limit=1e2', '?limit=01', '?limit=1&limit=2', '?cursor=2026-10-28T14:23:45Z',
      '?cursor=tl1.invalid', '?cursor=x&cursor=y']) {
      await request(app.getHttpServer()).get('/admin/treasury/transactions' + suffix).expect(400);
    }
    expect(listTransactions).not.toHaveBeenCalled();
  });
  it('preserves default 30 and valid limit 100', async () => {
    listTransactions.mockClear();
    await request(app.getHttpServer()).get('/admin/treasury/transactions').expect(200);
    await request(app.getHttpServer()).get('/admin/treasury/transactions?limit=100').expect(200);
    expect(listTransactions.mock.calls).toEqual([[30, undefined], [100, undefined]]);
  });
});
