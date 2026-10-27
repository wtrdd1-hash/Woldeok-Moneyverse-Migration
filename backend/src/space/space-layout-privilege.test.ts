import { describe, expect, it, vi } from 'vitest';
import { PostgresSpaceRepository, SpaceInputError } from './space.repository';

const actor = '11111111-2222-4333-8444-555555555555';
const space = '22222222-3333-4444-8555-666666666666';

describe('P0 #1502 owner-only layout after revoking broad space DML', () => {
  it('calls a SQL SECURITY DEFINER owner-scoped function, not direct UPDATE', async () => {
    const query = vi.fn().mockResolvedValueOnce({ rows: [{ user_id: actor }] })
      .mockResolvedValueOnce({ rows: [{ updated: true }] });
    const repo = new PostgresSpaceRepository({ query });
    await expect(repo.updateSpaceLayout(actor, space, { theme: 'safe' })).resolves.toBe(true);
    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[1]?.[0]).toMatch(/SELECT public\.space_update_layout\(/i);
    expect(query.mock.calls[1]?.[0]).not.toMatch(/UPDATE public\.user_spaces/i);
    expect(query.mock.calls[1]?.[1]).toEqual([actor, space, JSON.stringify({ theme: 'safe' })]);
  });

  it('does not call the mutation for a different owner', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ user_id: space }] });
    const repo = new PostgresSpaceRepository({ query });
    await expect(repo.updateSpaceLayout(actor, space, { theme: 'safe' })).rejects.toBeInstanceOf(SpaceInputError);
    expect(query).toHaveBeenCalledTimes(1);
  });
});
