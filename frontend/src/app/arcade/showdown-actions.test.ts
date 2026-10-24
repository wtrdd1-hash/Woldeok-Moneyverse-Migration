import { afterEach, describe, expect, it, vi } from 'vitest';
import { playMiniShowdownRound } from './showdown-actions';
import { mutate } from '@/lib/mutate';

vi.mock('@/lib/mutate', () => ({ mutate: vi.fn() }));
const mockMutate = vi.mocked(mutate);
afterEach(() => vi.resetAllMocks());

describe('server-only practice showdown action', () => {
  it('sends no client-selected dice, result, or money', async () => {
    mockMutate.mockResolvedValue({ success: true, mode: 'PRACTICE_ONLY', playerRoll: [6], aiRoll: [1], outcome: 'win', stake: '0', payout: '0', resolvedAt: '2026-10-25T00:00:00.000Z' });
    const result = await playMiniShowdownRound();
    expect(mockMutate).toHaveBeenCalledWith('/api/v1/engagement/dopamine/mini-showdown', { body: {} });
    expect(result?.outcome).toBe('win');
  });
  it('never converts an unavailable or paying API response into success', async () => {
    mockMutate.mockResolvedValueOnce({ success: true, mode: 'PRACTICE_ONLY', payout: '190', stake: '0', playerRoll: [6], aiRoll: [1], outcome: 'win', resolvedAt: '2026-10-25T00:00:00.000Z' });
    expect(await playMiniShowdownRound()).toBeNull();
    mockMutate.mockRejectedValueOnce(new Error('backend offline'));
    expect(await playMiniShowdownRound()).toBeNull();
  });
});
