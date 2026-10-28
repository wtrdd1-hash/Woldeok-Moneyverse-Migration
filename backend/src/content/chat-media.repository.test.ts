import { describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { ChatMediaRepository } from './chat-media.repository';

const actor = '11111111-1111-4111-8111-111111111111';
const key = 'chat_aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png';

describe('ChatMediaRepository', () => {
  it('registers media only through the parameterized SECURITY DEFINER function', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ registered: true }] });
    const repo = new ChatMediaRepository({ query } as unknown as Queryable);
    await repo.register(actor, key);
    expect(query).toHaveBeenCalledWith(
      'SELECT public.chat_media_register($1::uuid, $2::text) AS registered',
      [actor, key],
    );
  });

  it('fails closed on a conflicting owner or unavailable database', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ registered: false }] });
    const repo = new ChatMediaRepository({ query } as unknown as Queryable);
    await expect(repo.register(actor, key)).rejects.toBeInstanceOf(ServiceUnavailableException);
    query.mockRejectedValue(new Error('database offline'));
    await expect(repo.register(actor, key)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('uses owner-scoped SQL to deny unknown or foreign keys', async () => {
    const query = vi.fn().mockResolvedValueOnce({ rows: [{ visible: false }] }).mockResolvedValueOnce({ rows: [{ visible: true }] });
    const repo = new ChatMediaRepository({ query } as unknown as Queryable);
    expect(await repo.visibleTo(actor, key, '99999999-9999-4999-8999-999999999999')).toBe(false);
    expect(await repo.visibleTo(actor, key)).toBe(true);
    expect(query).toHaveBeenCalledWith(
      'SELECT public.chat_media_visible($1::uuid, $2::text, $3::uuid) AS visible',
      [actor, key, '99999999-9999-4999-8999-999999999999'],
    );
  });

  it('does not read or register without a database', async () => {
    const repo = new ChatMediaRepository(null);
    await expect(repo.visibleTo(actor, key)).rejects.toBeInstanceOf(ServiceUnavailableException);
    await expect(repo.register(actor, key)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
