import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { ProcureMaterialsDto } from './business.controller';

const validKey = '550e8400-e29b-41d4-a716-446655440000';
const errors = (body: Record<string, unknown>) =>
  validateSync(plainToInstance(ProcureMaterialsDto, body));

describe('business procurement idempotency contract', () => {
  it('requires a caller-owned UUID idempotency key', () => {
    expect(errors({ materialCode: 'RAW_PACKAGED', quantity: 20 })).not.toHaveLength(0);
    expect(errors({ materialCode: 'RAW_PACKAGED', quantity: 20, idempotencyKey: 'retry-me' })).not.toHaveLength(0);
  });

  it('accepts a valid procurement command and bounds quantity', () => {
    expect(errors({ materialCode: 'RAW_PACKAGED', quantity: 20, idempotencyKey: validKey })).toHaveLength(0);
    expect(errors({ materialCode: 'RAW_PACKAGED', quantity: 501, idempotencyKey: validKey })).not.toHaveLength(0);
  });
});
