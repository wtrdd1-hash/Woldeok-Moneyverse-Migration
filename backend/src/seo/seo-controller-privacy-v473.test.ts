import { expect, it, vi } from 'vitest';
import { SeoController } from './seo.controller';
it('public status projects only aggregates', async () => {
  const service = { getSeoMetrics: vi.fn().mockResolvedValue({ totalHits24h: 1, recentLogs: [1] }) };
  const controller = new SeoController(service as never, {} as never, {} as never, {} as never);
  expect(await controller.getStatus()).not.toHaveProperty('recentLogs');
});