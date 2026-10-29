import { describe, expect, it } from 'vitest';
import { parseAutoGenerateReceipt } from './auto-generate-receipt';

describe('automatic market-news receipt contradictions', () => {
  it('rejects a skipped result that also claims a market event was published', () => {
    expect(parseAutoGenerateReceipt({
      skipped: true, reason: 'no_registered_stocks',
      published: true, eventId: '44444444-4444-4444-8444-444444444444',
    })).toBeNull();
  });

  it('rejects an unpublished batch that also contains a publication event ID', () => {
    expect(parseAutoGenerateReceipt({
      generated: 1, published: false, batchId: '33333333-3333-4333-8333-333333333333',
      engine: 'test-model', eventId: '44444444-4444-4444-8444-444444444444',
    })).toBeNull();
  });
});
