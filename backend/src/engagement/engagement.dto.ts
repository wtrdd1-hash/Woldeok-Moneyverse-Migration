import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class EngagementProgressDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;

  /**
   * Absent means one, which is what a single reported event is worth.
   *
   * A JSON integer, not a string: the global pipe runs with
   * `enableImplicitConversion` off, so a numeric string is rejected rather
   * than quietly coerced. The bounds are 082's own -- it raises 22023 outside
   * 1..1000 -- and they are repeated here so that an out-of-range report is
   * refused as a bad field rather than as a conflict.
   */
  @ApiProperty({ required: false, type: Number, minimum: 1, maximum: 1000 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  readonly amount?: number;
}

export class EngagementNpcOrderDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class EngagementPreferencesDto {
  /**
   * Required rather than optional: this route sets the preference to the
   * value it is given, and an absent field would have to mean either "leave
   * it alone" or "turn it off". A member switching notifications off is the
   * whole point of the route, so the off case must not be the ambiguous one.
   */
  @ApiProperty({ type: Boolean })
  @IsBoolean()
  readonly notificationsEnabled!: boolean;
}
