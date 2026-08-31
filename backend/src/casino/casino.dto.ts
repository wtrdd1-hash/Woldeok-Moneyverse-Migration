import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsISO8601, IsOptional, IsPositive, IsUUID, Min } from 'class-validator';

export class CasinoPlayDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;

  @ApiProperty({ enum: ['heads', 'tails'] })
  @IsIn(['heads', 'tails'])
  readonly choice!: 'heads' | 'tails';

  /**
   * A JSON integer, not a string, and no maximum here: public.casino_policy
   * owns the stake range and an operator moves it without a deploy. The
   * global pipe runs with `enableImplicitConversion` off, so a numeric string
   * is rejected rather than quietly coerced -- which is the coercion that
   * destroys a value above 2^53.
   */
  @ApiProperty({ type: Number, minimum: 1 })
  @IsInt()
  @IsPositive()
  readonly stake!: number;
}

export class CasinoDicePlayDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;

  @ApiProperty({ enum: ['dice_parity', 'dice_number'] })
  @IsIn(['dice_parity', 'dice_number'])
  readonly game!: 'dice_parity' | 'dice_number';

  /**
   * Every choice either game accepts, in one list. Whether this one belongs to
   * that game is decided where the rule lives -- `casino_dice_is_win` -- and
   * repeated in the repository so a mismatch is a 400 about the field rather
   * than a 409 about a function. A validator cannot express the pairing
   * without splitting this into two routes, which would put the same rule in a
   * third place.
   */
  @ApiProperty({ enum: ['odd', 'even', '1', '2', '3', '4', '5', '6'] })
  @IsIn(['odd', 'even', '1', '2', '3', '4', '5', '6'])
  readonly choice!: string;

  /** A JSON integer, for the reason `CasinoPlayDto.stake` gives. */
  @ApiProperty({ type: Number, minimum: 1 })
  @IsInt()
  @IsPositive()
  readonly stake!: number;
}

export class CasinoSelfLimitDto {
  /** Zero is a real answer: it is the member saying they will stake nothing. */
  @ApiProperty({ type: Number, minimum: 0 })
  @IsInt()
  @Min(0)
  readonly dailyBetLimit!: number;

  @ApiProperty({ type: Number, minimum: 0 })
  @IsInt()
  @Min(0)
  readonly dailyLossLimit!: number;

  /**
   * Absent leaves the member able to change their limits again immediately.
   * A moment in the future is a lock they cannot lift until it passes, which
   * is the point of a self-exclusion; 080 measures it against the database's
   * clock, not this one.
   */
  @ApiProperty({ required: false, format: 'date-time' })
  @IsOptional()
  @IsISO8601()
  readonly lockedUntil?: string;
}
