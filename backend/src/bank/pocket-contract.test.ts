import { describe, expect, it, vi } from 'vitest';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import type { RequestWithSession } from '../auth/session.context';
import type { BankRepository } from './bank.repository';
import { PocketController } from './pocket.controller';
import { CreatePocketDto, CustomizePocketDto } from './pocket.dto';

const actor = '8e9c4a11-ed8d-4e53-a492-f0e56842b231';
const pocket = '73bb6eda-68dd-4cef-bb7f-4af74b851563';
const requestKey = 'e64690be-43d2-4709-81b5-1f062c8c74e6';
const request = { session: { user_id: actor } } as unknown as RequestWithSession;

describe('pocket API safety contract', () => {
  it('allows a savings pocket without an optional savings target', async () => {
    const dto = plainToInstance(CreatePocketDto, { name: 'Emergency', idempotencyKey: requestKey });
    expect(await validate(dto)).toEqual([]);
  });

  it('refuses a theme mutation without a valid idempotency key', async () => {
    const missing = plainToInstance(CustomizePocketDto, { themeColor: 'emerald' });
    const invalid = plainToInstance(CustomizePocketDto, { themeColor: 'emerald', idempotencyKey: '00000000-0000-0000-0000-000000000000' });
    const present = plainToInstance(CustomizePocketDto, { themeColor: 'emerald', idempotencyKey: requestKey });
    expect((await validate(missing)).some(e => e.property === 'idempotencyKey')).toBe(true);
    expect((await validate(invalid)).some(e => e.property === 'idempotencyKey')).toBe(true);
    expect(await validate(present)).toEqual([]);
  });

  it('forwards client-provided unique operation key to the financial repository', async () => {
    const customizePocket = vi.fn().mockResolvedValue({ cost_wld: '5' });
    const controller = new PocketController({ customizePocket } as unknown as BankRepository);
    await controller.customizePocket(request, pocket, {
      themeColor: 'emerald', idempotencyKey: requestKey,
    });
    expect(customizePocket).toHaveBeenCalledWith(requestKey, actor, pocket, 'emerald', undefined);
  });
});
