import { describe, expect, it, vi } from 'vitest';
import type { Pool } from 'pg';
import { KdicRepository } from './kdic.repository';

describe('KDIC public snapshot security boundary', () => {
  it('uses the restricted function and preserves 21-digit WLD values as strings', async () => {
    const exact = '900719925474099312345';
    const query = vi.fn().mockResolvedValue({ rows: [{ snapshot: { fund: { totalFundWld: exact }, institutions: [] } }] });
    const repo = new KdicRepository({ query } as unknown as Pool);
    const snapshot = await repo.getPublicPortalSnapshot();
    expect(query).toHaveBeenCalledWith('SELECT public.kdic_public_portal_snapshot() AS snapshot');
    expect((snapshot.fund as { totalFundWld: string }).totalFundWld).toBe(exact);
  });

  it('fails closed when the DB returns no snapshot', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repo = new KdicRepository({ query } as unknown as Pool);
    await expect(repo.getPublicPortalSnapshot()).rejects.toThrow('unavailable');
  });
});
