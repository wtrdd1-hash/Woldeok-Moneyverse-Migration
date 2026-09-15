import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsUUID, registerDecorator, type ValidationArguments, type ValidationOptions } from 'class-validator';

/** Monetary request values prefer canonical decimal strings. Safe integer JSON
 * numbers remain accepted for backward compatibility with older app builds. */
const POSITIVE_WLD = /^[1-9][0-9]*$/;

function IsWldRequestAmount(options?: ValidationOptions) {
  return (object: object, propertyName: string): void => {
    registerDecorator({
      name: 'isWldRequestAmount',
      target: object.constructor,
      propertyName,
      ...(options ? { options } : {}),
      validator: {
        validate(value: unknown): boolean {
          return (
            (typeof value === 'string' && POSITIVE_WLD.test(value)) ||
            (typeof value === 'number' && Number.isSafeInteger(value) && value > 0)
          );
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} must be a positive WLD integer string`;
        },
      },
    });
  };
}

type WldRequestAmount = string | number;

export class TransferDto {
  @ApiProperty({ format: 'uuid', description: 'Recipient user id' })
  @IsUUID()
  readonly recipientUserId!: string;

  @ApiProperty({ oneOf: [{ type: 'string', pattern: '^[1-9][0-9]*$' }, { type: 'integer', minimum: 1 }], example: '100000000000000000000' })
  @IsWldRequestAmount()
  readonly amount!: WldRequestAmount;

  @ApiProperty({ format: 'uuid', description: 'Client-generated idempotency key' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class BankMovementDto {
  @ApiProperty({ enum: ['deposit', 'withdraw'] })
  @IsIn(['deposit', 'withdraw'])
  readonly direction!: 'deposit' | 'withdraw';

  @ApiProperty({ oneOf: [{ type: 'string', pattern: '^[1-9][0-9]*$' }, { type: 'integer', minimum: 1 }] })
  @IsWldRequestAmount()
  readonly amount!: WldRequestAmount;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class BorrowDto {
  @ApiProperty({ oneOf: [{ type: 'string', pattern: '^[1-9][0-9]*$' }, { type: 'integer', minimum: 1 }] })
  @IsWldRequestAmount()
  readonly principalAmount!: WldRequestAmount;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class RepayDto {
  @ApiProperty({ oneOf: [{ type: 'string', pattern: '^[1-9][0-9]*$' }, { type: 'integer', minimum: 1 }] })
  @IsWldRequestAmount()
  readonly amount!: WldRequestAmount;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class ClaimDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}
