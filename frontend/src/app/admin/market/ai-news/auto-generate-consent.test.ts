import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/mutate', () => ({
  failure: vi.fn(() => ({ status: 'error', message: 'Request failed' })),
  idempotencyKey: vi.fn(() => '11111111-1111-4111-8111-111111111111'),
  mutate: vi.fn(),
}));
vi.mock('../../step-up', () => ({ STEP_UP_CODE: /^[0-9]{6}$/, spendSecondFactorCode: vi.fn() }));

import { mutate } from '@/lib/mutate';
import { autoGenerateAiNews } from './actions';

const mockMutate = vi.mocked(mutate);
const form = (publishImmediate: boolean) => {
  const data = new FormData();
  if (publishImmediate) data.set('publishImmediate', 'true');
  return data;
};

beforeEach(() => vi.clearAllMocks());

describe('admin AI market-news publication receipts', () => {
  it('does not claim success when the backend skips generation', async () => {
    mockMutate.mockResolvedValueOnce({ skipped: true, reason: 'no_registered_stocks' });
    const result = await autoGenerateAiNews({ status: 'idle' }, form(false));
    expect(result.status).toBe('error');
    expect(result.message).not.toContain('완료');
  });

  it('rejects a malformed response instead of inventing a generated scenario', async () => {
    mockMutate.mockResolvedValueOnce({ success: true });
    const result = await autoGenerateAiNews({ status: 'idle' }, form(false));
    expect(result.status).toBe('error');
  });

  it('reports a draft batch as unpublished and forwards false to the backend', async () => {
    mockMutate.mockResolvedValueOnce({ generated: 3, published: false, batchId: '33333333-3333-4333-8333-333333333333', engine: 'gpt-4o-mini' });
    const result = await autoGenerateAiNews({ status: 'idle' }, form(false));
    expect(result.status).toBe('ok');
    expect(result.message).toContain('3개');
    expect(result.message).toContain('발행되지');
    expect(mockMutate).toHaveBeenCalledWith('/api/v1/admin/ai-news/auto-generate', expect.objectContaining({ body: expect.objectContaining({ publishImmediate: false }) }));
  });

  it('requires a publication event receipt before announcing market publication', async () => {
    mockMutate.mockResolvedValueOnce({ generated: 5, published: true, batchId: '33333333-3333-4333-8333-333333333333', headline: 'Market story', engine: 'gpt-4o-mini' });
    const result = await autoGenerateAiNews({ status: 'idle' }, form(true));
    expect(result.status).toBe('error');
  });

  it('announces only a real published event and discloses deterministic fallback', async () => {
    mockMutate.mockResolvedValueOnce({ generated: 5, published: true, batchId: '33333333-3333-4333-8333-333333333333', eventId: '44444444-4444-4444-8444-444444444444', scenarioId: '55555555-5555-4555-8555-555555555555', eventsPublished: 1, headline: 'Market story', engine: 'deterministic-financial-engine' });
    const result = await autoGenerateAiNews({ status: 'idle' }, form(true));
    expect(result.status).toBe('ok');
    expect(result.message).toContain('발행');
    expect(result.message).toContain('규칙 기반');
    expect(mockMutate).toHaveBeenCalledWith('/api/v1/admin/ai-news/auto-generate', expect.objectContaining({ body: expect.objectContaining({ publishImmediate: true }) }));
  });
});
