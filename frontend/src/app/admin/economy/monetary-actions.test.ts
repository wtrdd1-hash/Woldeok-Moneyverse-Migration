import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
const { mutate, revalidatePath } = vi.hoisted(() => ({ mutate: vi.fn(), revalidatePath: vi.fn() }));
vi.mock('@/lib/mutate', () => ({ mutate, failure: () => ({ message: 'Unavailable' }) }));
vi.mock('next/cache', () => ({ revalidatePath }));
import { runMonetaryCommand } from './monetary-actions';

describe('monetary server-only mutation contract', () => {
  beforeEach(() => vi.clearAllMocks());
  it('sends approved operations through the server CSRF helper', async () => {
    mutate.mockResolvedValue({ id: 'receipt-1' });
    expect(await runMonetaryCommand('run-regulation')).toEqual({ success: true });
    expect(mutate).toHaveBeenCalledWith('/api/v1/admin/economy/monetary/auto-regulation/run', { body: undefined });
    expect(revalidatePath).toHaveBeenCalledWith('/admin/economy');
  });
  it('rejects unknown and malformed commands without contacting backend', async () => {
    expect(await runMonetaryCommand('other' as 'freeze')).toMatchObject({ success: false });
    expect(await runMonetaryCommand('approve', { id: '../oops' })).toMatchObject({ success: false });
    expect(mutate).not.toHaveBeenCalled();
  });
  it('never invents success when the backend does not confirm execution', async () => {
    mutate.mockResolvedValue(null);
    expect(await runMonetaryCommand('run-regulation')).toMatchObject({ success: false });
    mutate.mockRejectedValue(new Error('session expired'));
    expect(await runMonetaryCommand('run-regulation')).toMatchObject({ success: false });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
  it('client UI does not bypass server actions with direct monetary POSTs', () => {
    const source = readFileSync(new URL('./monetary-bureau-card.tsx', import.meta.url), 'utf8');
    expect(source).not.toMatch(/fetch\(['"`]\/api\/v1\/admin\/economy\/monetary\/[^\n]*\{\s*method:\s*'POST'/);
    expect(source).toContain('runMonetaryCommand');
  });
});
