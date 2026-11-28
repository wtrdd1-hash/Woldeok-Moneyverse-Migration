import { describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/api', () => ({ api: vi.fn(), apiOrNull: vi.fn(), mutate: vi.fn() }));
vi.mock('@/lib/session', () => ({ requireMember: vi.fn() }));

const { cancelPlusMembership } = await import('./actions');

// W03: the cancel action answered success without calling any server, so a member was told the
// renewal was cancelled while nothing changed. No cancellation endpoint exists; say so.
describe('cancelPlusMembership', () => {
  it('does not claim a cancellation that never reached the server', async () => {
    const result = await cancelPlusMembership();
    expect(result.success).toBe(false);
  });
});

describe('subscribePlusMembership', () => {
  it('refuses an id that is not a catalogue uuid', async () => {
    const { subscribePlusMembership } = await import('./actions');
    const result = await subscribePlusMembership('not-a-catalogue-id');
    expect(result.success).toBe(false);
  });
});
