import { describe, expect, it, vi } from 'vitest';
import type { AiNewsRepository } from './ai-news.repository';
import { AiNewsService } from './ai-news.service';
import { AiNewsController } from './ai-news.controller';

const ACTOR = '11111111-1111-4111-8111-111111111111';

describe('admin automatic market-news publication consent', () => {
  it('persists generated proposals without publishing when consent is false', async () => {
    const repository = {
      context: vi.fn(async () => ({ stocks: [{ symbol: 'MYUY', name: 'Stock' }], live_events: [] })),
      credential: vi.fn(async () => ({ api_base_url: 'https://api.example/v1', model: 'test-model', api_key_sealed: null, api_key_key_id: null })),
      createBatch: vi.fn(async () => ({ batch_id: '33333333-3333-4333-8333-333333333333', replayed: false })),
      latest: vi.fn(async () => null),
      publish: vi.fn(),
    } as unknown as AiNewsRepository;
    const service = new AiNewsService(repository, null, vi.fn(async () => ({
      scenarios: [{
        headline: 'Stock moves', body: 'News', rationale: 'Source',
        hours: 6, effects: [{ stock_symbol: 'MYUY', direction: 'up', strength: 1 }],
      }],
    })));
    const result = await service.autoGenerateAndPublish(ACTOR, { apiBaseUrl: 'https://api.example/v1', apiKey: '', model: 'test-model' }, false);
    expect(result).toMatchObject({ generated: 1, published: false, engine: 'test-model' });
    expect(repository.createBatch).toHaveBeenCalledOnce();
    expect(repository.publish).not.toHaveBeenCalled();
    expect(repository.latest).not.toHaveBeenCalled();
  });

  it('passes missing and false consent to the service as draft-only', async () => {
    const service = { autoGenerateAndPublish: vi.fn(async (...args: unknown[]) => args) };
    const controller = new AiNewsController(service as never);
    const request = { session: { user_id: ACTOR } };
    const call = controller.autoGenerate as (...args: unknown[]) => Promise<unknown>;
    await call.call(controller, request, {});
    await call.call(controller, request, { publishImmediate: false });
    expect(service.autoGenerateAndPublish).toHaveBeenNthCalledWith(1, ACTOR, undefined, false);
    expect(service.autoGenerateAndPublish).toHaveBeenNthCalledWith(2, ACTOR, undefined, false);
  });

  it('only passes true when the operator explicitly consents to immediate publication', async () => {
    const service = { autoGenerateAndPublish: vi.fn(async (...args: unknown[]) => args) };
    const controller = new AiNewsController(service as never);
    const request = { session: { user_id: ACTOR } };
    const call = controller.autoGenerate as (...args: unknown[]) => Promise<unknown>;
    await call.call(controller, request, { publishImmediate: true });
    expect(service.autoGenerateAndPublish).toHaveBeenCalledWith(ACTOR, undefined, true);
  });
});
