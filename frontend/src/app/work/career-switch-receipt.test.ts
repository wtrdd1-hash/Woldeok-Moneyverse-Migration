import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mutate, read, revalidate } = vi.hoisted(() => ({
  mutate: vi.fn(), read: vi.fn(), revalidate: vi.fn(),
}));
vi.mock('@/lib/mutate', () => ({ mutate, failure: (_error: unknown, message: string) => ({ status: 'error', message }) }));
vi.mock('@/lib/api', () => ({ api: read }));
vi.mock('next/cache', () => ({ revalidatePath: revalidate }));

import { switchJobAction } from './actions';

const job = 'developer';
const form = () => { const data = new FormData(); data.set('jobType', job); return data; };
const mutation = { job_type: job, is_active: true, level: 2, current_experience: '50' };
const profile = { active_job: { job_type: job, level: 2 }, all_jobs: [{ job_type: job, is_active: true }] };

beforeEach(() => { vi.clearAllMocks(); });

describe('verified career switch against member-owned backend profile', () => {
  it.each([
    null, {}, { job_type: 'trader', is_active: true },
    { job_type: job, is_active: false },
    { job_type: job, is_active: 'true' },
  ])('never reports success for a missing or contradictory switch receipt: %j', async (receipt) => {
    mutate.mockResolvedValue(receipt);
    const result = await switchJobAction({ status: 'idle' }, form());
    expect(result.status).toBe('error');
    expect(read).not.toHaveBeenCalled();
    expect(revalidate).not.toHaveBeenCalled();
  });

  it.each([
    null, {}, { active_job: null },
    { active_job: { job_type: 'trader' } },
    { active_job: { job_type: job }, all_jobs: [{ job_type: 'trader', is_active: true }] },
  ])('does not claim a career switch when the owner profile does not confirm it: %j', async (readback) => {
    mutate.mockResolvedValue(mutation);
    read.mockResolvedValue(readback);
    const result = await switchJobAction({ status: 'idle' }, form());
    expect(result.status).toBe('error');
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('returns an ambiguous outcome rather than a failed switch when readback is unavailable', async () => {
    mutate.mockResolvedValue(mutation);
    read.mockRejectedValue(new Error('read timed out'));
    const result = await switchJobAction({ status: 'idle' }, form());
    expect(result.status).toBe('error');
    expect(result.message).toContain('확인');
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('only reports success after both the mutation receipt and owner profile agree', async () => {
    mutate.mockResolvedValue(mutation);
    read.mockResolvedValue(profile);
    const result = await switchJobAction({ status: 'idle' }, form());
    expect(result.status).toBe('ok');
    expect(mutate).toHaveBeenCalledWith('/api/v1/work/active-job', { body: { jobType: job } });
    expect(read).toHaveBeenCalledWith('/api/v1/work/profile');
    expect(revalidate).toHaveBeenCalledWith('/work');
    expect(revalidate).toHaveBeenCalledWith('/profile');
  });
});
