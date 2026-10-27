import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { BankRepository, BankInputError } from './bank.repository';

const key = '11111111-1111-4111-8111-111111111111';
const actor = '22222222-2222-4222-8222-222222222222';
const pocket = '33333333-3333-4333-8333-333333333333';

describe('P0 bank pocket overload routing', () => {
  const query = vi.fn().mockResolvedValue({ rows: [{ pocket_id: pocket }] });
  const repo = new BankRepository({ query } as unknown as Queryable);

  it('uses UUID-key overload for transfer, never the legacy text-key function', async () => {
    query.mockClear();
    await repo.transferPocket(key, actor, pocket, 'deposit', '100');
    expect(query).toHaveBeenCalledOnce();
    const [sql, values] = query.mock.calls[0] as [string, unknown[]];
    expect(sql).toMatch(/bank_transfer_pocket\(\$1::uuid,\s*\$2::uuid,\s*\$3::uuid,\s*\$4::text,\s*\$5::bigint\)/);
    expect(values).toEqual([key, actor, pocket, 'deposit', '100']);
  });

  it('uses UUID-key overload for customization, never the legacy text-key function', async () => {
    query.mockClear();
    await repo.customizePocket(key, actor, pocket, 'sky', 'piggy-bank');
    const [sql] = query.mock.calls[0] as [string];
    expect(sql).toMatch(/bank_customize_pocket\(\$1::uuid,\s*\$2::uuid,\s*\$3::uuid,\s*\$4::text,\s*\$5::text\)/);
  });

  it('uses UUID-key overload for archive, never the legacy text-key function', async () => {
    query.mockClear();
    await repo.archivePocket(key, actor, pocket);
    const [sql] = query.mock.calls[0] as [string];
    expect(sql).toMatch(/bank_archive_pocket\(\$1::uuid,\s*\$2::uuid,\s*\$3::uuid\)/);
  });

  it('rejects a non-UUID idempotency key before any SQL', async () => {
    query.mockClear();
    await expect(repo.archivePocket('unsafe-key', actor, pocket)).rejects.toBeInstanceOf(BankInputError);
    expect(query).not.toHaveBeenCalled();
  });
});
