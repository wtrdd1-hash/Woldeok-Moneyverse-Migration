import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class PurchaseDto {
  @ApiProperty({ format: 'uuid', description: 'Client-generated idempotency key' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class CatalogPurchaseDto {
  @ApiProperty({ format: 'uuid', description: 'Client-generated idempotency key' })
  @IsUUID()
  readonly idempotencyKey!: string;

  /**
   * A count, not an amount, so it may safely be a JSON number: 100 is the
   * ceiling `shop_purchase_catalog` itself enforces. The price is not a field
   * here and never will be -- the function reads it from the catalogue inside
   * the transaction that charges for it.
   *
   * `enableImplicitConversion` is off in the global pipe, so a JSON string
   * fails validation rather than being quietly coerced.
   */
  @ApiProperty({
    type: Number,
    minimum: 1,
    maximum: 100,
    required: false,
    description: 'How many to buy; one when omitted',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  readonly quantity?: number;
}

export class ItemConsumptionDto {
  @ApiProperty({ format: 'uuid', description: 'Client-generated idempotency key' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

/**
 * A key and nothing else, like the two above it.
 *
 * The amount is deliberately absent rather than optional: `shop_settle_upkeep`
 * reads the capped `amount_due` inside the transaction that charges it, so a
 * figure sent from a card rendered before the weekly run could only be wrong.
 * Its own class rather than a reuse of `ItemConsumptionDto` because the two
 * appear as different bodies in the generated API document, and a shared name
 * would tell a reader the two routes take the same thing for the same reason.
 */
export class UpkeepSettlementDto {
  @ApiProperty({ format: 'uuid', description: 'Client-generated idempotency key' })
  @IsUUID()
  readonly idempotencyKey!: string;
}
