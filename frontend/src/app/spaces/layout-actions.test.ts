import { beforeEach, describe, expect, it, vi } from 'vitest';
const { write, read } = vi.hoisted(() => ({ write: vi.fn(), read: vi.fn() }));
vi.mock('@/lib/mutate', () => ({ mutate: write }));
vi.mock('@/lib/api', () => ({ api: read }));
import { saveSpaceLayout } from './layout-actions';
const id = 'c45b5d83-54ab-4971-9ca5-f10c671ac94a';
const layout = { grid: [[null, 'desk']], spaceName: 'Studio', updatedAt: '2026-11-02T00:00:00.000Z' };
beforeEach(() => { vi.clearAllMocks(); });
describe('owner space layout server-action receipts', () => {
  it('rejects a malformed space ID without issuing a write', async () => {
    expect(await saveSpaceLayout('wrong', layout)).toMatchObject({ status: 'error' });
    expect(write).not.toHaveBeenCalled();
  });
  it('rejects a write that returns ok=false', async () => {
    write.mockResolvedValue({ ok: false });
    expect(await saveSpaceLayout(id, layout)).toMatchObject({ status: 'error' });
    expect(read).not.toHaveBeenCalled();
  });
  it('rejects an HTTP-success response with missing readback', async () => {
    write.mockResolvedValue({ ok: true }); read.mockResolvedValue({ space: null });
    expect(await saveSpaceLayout(id, layout)).toMatchObject({ status: 'error' });
  });
  it('rejects a stale or mismatched persisted layout', async () => {
    write.mockResolvedValue({ ok: true }); read.mockResolvedValue({ space: { id, layout: { grid: [] } } });
    expect(await saveSpaceLayout(id, layout)).toMatchObject({ status: 'error' });
  });
  it('accepts a semantically identical JSONB layout with reordered keys', async () => {
    write.mockResolvedValue({ ok: true });
    read.mockResolvedValue({ space: { id, layout: { updatedAt: layout.updatedAt, spaceName: layout.spaceName, grid: layout.grid } } });
    expect(await saveSpaceLayout(id, layout)).toMatchObject({ status: 'ok' });
  });
  it('fails closed when the backend is unavailable', async () => {
    write.mockRejectedValue(new Error('backend unavailable'));
    expect(await saveSpaceLayout(id, layout)).toMatchObject({ status: 'error' });
    expect(read).not.toHaveBeenCalled();
  });
  it('reports success only after a matching owner readback', async () => {
    write.mockResolvedValue({ ok: true }); read.mockResolvedValue({ space: { id, layout } });
    expect(await saveSpaceLayout(id, layout)).toMatchObject({ status: 'ok' });
    expect(write).toHaveBeenCalledWith(`/api/v1/spaces/${id}/layout`, { method: 'PUT', body: { layout } });
    expect(read).toHaveBeenCalledWith(`/api/v1/spaces/${id}`);
  });
});
