import { describe, expect, it } from 'vitest';
import { SKIP_INTERNAL_TOKEN } from '../auth/guards/skip-internal-token.decorator';
import { SeoController } from './seo.controller';

describe('crawler telemetry ingestion authority', () => {
  it('requires the shared internal API token for crawler log writes', () => {
    const handler = Object.getOwnPropertyDescriptor(SeoController.prototype, 'logCrawlerHit')?.value;
    expect(Reflect.getMetadata(SKIP_INTERNAL_TOKEN, handler)).not.toBe(true);
  });
});
