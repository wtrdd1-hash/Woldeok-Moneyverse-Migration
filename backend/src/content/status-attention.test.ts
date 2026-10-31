import { afterEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';

afterEach(() => vi.useRealTimers());

function statusService() {
  const rows = [
    { source_key: 'healthy_api', display_name: 'Healthy', state: 'operational', detail: 'ok', observed_at: new Date('2026-11-01T00:00:00.000Z') },
    { source_key: 'outage_api', display_name: 'Outage', state: 'outage', detail: 'down', observed_at: new Date('2026-11-01T00:00:00.000Z') },
    { source_key: 'stale_api', display_name: 'Stale', state: 'operational', detail: 'old', observed_at: new Date('2026-10-31T23:58:00.000Z') },
  ];
  const repository = { publicStatus: vi.fn().mockResolvedValue(rows) };
  const service = Object.assign(Object.create(ContentService.prototype), { repository }) as ContentService;
  return { service, repository };
}

describe('public status attention-only filter', () => {
  it('retains the full view by default and filters after authoritative freshness normalization', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-01T00:00:00.000Z'));
    const { service, repository } = statusService();
    const all = await service.serviceStatus();
    expect(all.map((row) => row.sourceKey)).toEqual(['healthy_api', 'outage_api', 'stale_api']);
    const attention = await service.serviceStatus({ attentionOnly: true });
    expect(attention.map((row) => row.sourceKey)).toEqual(['outage_api', 'stale_api']);
    expect(attention[1]).toMatchObject({ state: 'unknown', freshnessState: 'stale' });
    expect(repository.publicStatus).toHaveBeenCalledTimes(2);
  });

  it('rejects invalid, duplicate and unknown query keys before reading status', async () => {
    const serviceStatus = vi.fn().mockResolvedValue([]);
    const controller = new ContentController({ serviceStatus } as never);
    for (const query of [
      { attentionOnly: 'true' },
      { attentionOnly: ['1', '1'] },
      { attentionOnly: '0' },
      { unexpected: '1' },
    ]) {
      await expect(controller.status(query)).rejects.toBeInstanceOf(BadRequestException);
    }
    await expect(controller.status({ attentionOnly: '1' })).resolves.toEqual({ status: [] });
    expect(serviceStatus).toHaveBeenCalledWith({ attentionOnly: true });
  });
});
