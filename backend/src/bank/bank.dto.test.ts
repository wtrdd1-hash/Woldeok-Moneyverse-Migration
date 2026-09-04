import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import {
  BankBondPurchaseDto,
  BankBorrowSmartDto,
  BankRepayDto,
  BankTransferDto,
} from './bank.dto';

const VALID_UUID = 'a0000000-0000-4000-8000-000000000001';
const VALID_LOAN_UUID = 'b0000000-0000-4000-8000-000000000002';

describe('BankTransferDto', () => {
  it('accepts number amount and transforms to integer string', async () => {
    const dto = plainToInstance(BankTransferDto, {
      amount: 100,
      idempotencyKey: VALID_UUID,
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.amount).toBe('100');
  });

  it('accepts valid string amount', async () => {
    const dto = plainToInstance(BankTransferDto, {
      amount: '5000',
      idempotencyKey: VALID_UUID,
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.amount).toBe('5000');
  });

  it('rejects zero or negative amount', async () => {
    const dtoZero = plainToInstance(BankTransferDto, {
      amount: 0,
      idempotencyKey: VALID_UUID,
    });
    const errorsZero = await validate(dtoZero);
    expect(errorsZero.length).toBeGreaterThan(0);

    const dtoNegative = plainToInstance(BankTransferDto, {
      amount: -50,
      idempotencyKey: VALID_UUID,
    });
    const errorsNegative = await validate(dtoNegative);
    expect(errorsNegative.length).toBeGreaterThan(0);
  });
});

describe('BankBorrowSmartDto and BankRepayDto', () => {
  it('transforms number amount for borrow and repay', async () => {
    const borrowDto = plainToInstance(BankBorrowSmartDto, {
      amount: 10000,
      idempotencyKey: VALID_UUID,
    });
    const borrowErrors = await validate(borrowDto);
    expect(borrowErrors).toHaveLength(0);
    expect(borrowDto.amount).toBe('10000');

    const repayDto = plainToInstance(BankRepayDto, {
      loanId: VALID_LOAN_UUID,
      amount: 2500,
      idempotencyKey: VALID_UUID,
    });
    const repayErrors = await validate(repayDto);
    expect(repayErrors).toHaveLength(0);
    expect(repayDto.amount).toBe('2500');
  });
});

describe('BankBondPurchaseDto', () => {
  it('validates bond code and numeric amount coercion', async () => {
    const bondDto = plainToInstance(BankBondPurchaseDto, {
      bondCode: 'BOND_7D',
      amount: 50000,
      idempotencyKey: VALID_UUID,
    });
    const errors = await validate(bondDto);
    expect(errors).toHaveLength(0);
    expect(bondDto.amount).toBe('50000');
  });
});
