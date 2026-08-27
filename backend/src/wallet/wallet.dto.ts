import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsPositive, IsUUID } from 'class-validator';

/**
 * Amounts arrive as integers, not strings, exactly as the original API
 * accepted them: the repository's `requirePositiveSafeInteger` is what bounds
 * them, and every value the *database* returns is a string carrying up to 38
 * digits. The asymmetry is deliberate — a request body cannot express a
 * balance too large for a safe integer, but a balance can be.
 *
 * `enableImplicitConversion` is off in the global pipe, so a JSON string here
 * fails validation rather than being quietly coerced to a number.
 */
export class TransferDto {
  @ApiProperty({ format: 'uuid', description: 'Recipient user id' })
  @IsUUID()
  readonly recipientUserId!: string;

  @ApiProperty({ type: Number, minimum: 1, description: 'Amount in WLD' })
  @IsInt()
  @IsPositive()
  readonly amount!: number;

  @ApiProperty({ format: 'uuid', description: 'Client-generated idempotency key' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class BankMovementDto {
  @ApiProperty({ enum: ['deposit', 'withdraw'] })
  @IsIn(['deposit', 'withdraw'])
  readonly direction!: 'deposit' | 'withdraw';

  @ApiProperty({ type: Number, minimum: 1 })
  @IsInt()
  @IsPositive()
  readonly amount!: number;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class BorrowDto {
  @ApiProperty({ type: Number, minimum: 1 })
  @IsInt()
  @IsPositive()
  readonly principalAmount!: number;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class RepayDto {
  @ApiProperty({ type: Number, minimum: 1 })
  @IsInt()
  @IsPositive()
  readonly amount!: number;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class ClaimDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}
