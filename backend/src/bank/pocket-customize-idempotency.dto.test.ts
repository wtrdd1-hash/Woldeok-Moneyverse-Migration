import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { CustomizePocketDto } from './pocket.dto';

const validKey = '33333333-3333-4333-8333-333333333333';

async function isValid(key?: string) {
  const dto = plainToInstance(CustomizePocketDto, { themeColor: 'emerald', idempotencyKey: key });
  return (await validate(dto)).length === 0;
}

describe('paid pocket customization request idempotency', () => {
  it('requires a caller-generated UUIDv4', async () => {
    expect(await isValid(validKey)).toBe(true);
    expect(await isValid()).toBe(false);
    expect(await isValid('00000000-0000-0000-0000-000000000000')).toBe(false);
    expect(await isValid('33333333-3333-1333-8333-333333333333')).toBe(false);
    expect(await isValid('not-a-uuid')).toBe(false);
  });
});
