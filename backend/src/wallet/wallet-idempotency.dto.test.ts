import { describe, expect, it } from 'vitest';
import { validateSync } from 'class-validator';
import { BankMovementDto, BorrowDto, RepayDto, TransferDto } from './wallet.dto';

const KEY = '11111111-1111-4111-8111-111111111111';
const USER = '22222222-2222-4222-8222-222222222222';
const AMOUNT = '99999999999999999999999999999999999999';
const cases = [
  { name: 'transfer', ctor: TransferDto, fields: { recipientUserId: USER, amount: AMOUNT } },
  { name: 'bank movement', ctor: BankMovementDto, fields: { direction: 'deposit', amount: AMOUNT } },
  { name: 'borrow', ctor: BorrowDto, fields: { principalAmount: AMOUNT } },
  { name: 'repayment', ctor: RepayDto, fields: { amount: AMOUNT } },
];
describe('backend financial idempotency boundary', () => {
  it.each(cases)('$name requires a UUID and preserves a 38-digit WLD string', ({ ctor, fields }) => {
    const missing = Object.assign(new ctor(), fields);
    expect(validateSync(missing).some((error) => error.property === 'idempotencyKey')).toBe(true);
    const invalid = Object.assign(new ctor(), fields, { idempotencyKey: 'invalid' });
    expect(validateSync(invalid).some((error) => error.property === 'idempotencyKey')).toBe(true);
    const valid = Object.assign(new ctor(), fields, { idempotencyKey: KEY });
    expect(validateSync(valid).some((error) => error.property === 'idempotencyKey')).toBe(false);
  });
});
