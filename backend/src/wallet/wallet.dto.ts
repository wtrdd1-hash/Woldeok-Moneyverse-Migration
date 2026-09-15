import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsUUID, registerDecorator } from 'class-validator';
import { isWldAmount } from '@moneyverse/contract';

/**
 * Accept both the legacy JSON integer shape and the new exact decimal-string
 * shape. Legacy numbers are accepted only while JavaScript can represent them
 * exactly; large WLD values must travel as strings.
 */
function IsPositiveWldInput() {
  return (target: object, propertyName: string): void => {
    registerDecorator({
      name: 'isPositiveWldInput',
      target: target.constructor,
      propertyName,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value === 'number') {
            return Number.isSafeInteger(value) && value > 0;
          }
          return (
            typeof value === 'string' &&
            isWldAmount(value) &&
            value !== '0' &&
            !value.startsWith('-')
          );
        },
        defaultMessage(): string {
          return 'amount must be a positive whole WLD value';
        },
      },
    });
  };
}

const WLD_INPUT_SCHEMA = {
  oneOf: [
    { type: 'string', pattern: '^[1-9][0-9]*$', example: '10000000000000000' },
    { type: 'integer', minimum: 1, example: 1000 },
  ],
  description: 'Exact whole WLD amount. Use a decimal string for large values.',
} as const;

export class TransferDto {
  @ApiProperty({ format: 'uuid', description: 'Recipient user id' })
  @IsUUID()
  readonly recipientUserId!: string;

  @ApiProperty(WLD_INPUT_SCHEMA)
  @IsPositiveWldInput()
  readonly amount!: string | number;

  @ApiProperty({ format: 'uuid', description: 'Client-generated idempotency key' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class BankMovementDto {
  @ApiProperty({ enum: ['deposit', 'withdraw'] })
  @IsIn(['deposit', 'withdraw'])
  readonly direction!: 'deposit' | 'withdraw';

  @ApiProperty(WLD_INPUT_SCHEMA)
  @IsPositiveWldInput()
  readonly amount!: string | number;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class BorrowDto {
  @ApiProperty(WLD_INPUT_SCHEMA)
  @IsPositiveWldInput()
  readonly principalAmount!: string | number;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class RepayDto {
  @ApiProperty(WLD_INPUT_SCHEMA)
  @IsPositiveWldInput()
  readonly amount!: string | number;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class ClaimDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}
