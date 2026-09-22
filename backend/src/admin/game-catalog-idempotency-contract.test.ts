import { describe, expect, it } from "vitest";
import { validate } from 'class-validator';
import { CorporateActionDto, PublishMarketEventDto, SetStockPriceDto } from './game-catalog.controller';

async function rejectedWithoutKey(dto: object): Promise<boolean> {
  const errors = await validate(Object.assign(dto, { idempotencyKey: undefined }));
  return errors.some((error) => error.property === 'idempotencyKey');
}

describe('admin stock mutation idempotency contract', () => {
  it.each([
    ['manual price', Object.assign(new SetStockPriceDto(), { price: 100 })],
    ['market event', Object.assign(new PublishMarketEventDto(), {
      direction: 'up', strength: 1, hours: 1, headline: 'event',
    })],
    ['corporate action', Object.assign(new CorporateActionDto(), { action: 'split', factor: 2 })],
  ])('requires a caller-owned idempotency key for %s', async (_name, dto) => {
    expect(await rejectedWithoutKey(dto)).toBe(true);
  });
});
