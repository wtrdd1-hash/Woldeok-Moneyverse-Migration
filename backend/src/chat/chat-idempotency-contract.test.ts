import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { SendMessageDto } from './chat.controller';

function errors(body: Record<string, unknown>) {
  return validateSync(plainToInstance(SendMessageDto, body));
}

describe('chat message idempotency contract', () => {
  it('requires a caller-owned UUID for message sends', () => {
    const validationErrors = errors({ body: 'hello' });
    expect(validationErrors.some((error) => error.property === 'idempotencyKey')).toBe(true);
  });

  it('rejects malformed idempotency keys', () => {
    const validationErrors = errors({ body: 'hello', idempotencyKey: 'retry-me' });
    expect(validationErrors.some((error) => error.property === 'idempotencyKey')).toBe(true);
  });

  it('accepts a valid caller-owned UUID', () => {
    expect(errors({ body: 'hello', idempotencyKey: '11111111-1111-4111-8111-111111111111' })).toHaveLength(0);
  });
});
