import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, Matches } from 'class-validator';

/**
 * Claiming the day's event.
 *
 * There is no event field, and there must not be one. `early_event_claim`
 * (103) draws the event for itself from a hash of the member and the Seoul
 * date, so a request that could name an event would be a request that could
 * choose one -- which is the whole thing this feature is built not to allow.
 *
 * `eventDate` is the day the screen was showing, taken from the read model,
 * where the database named it. It is sent rather than computed here on
 * purpose: computing it would mean a second Asia/Seoul implementation in
 * TypeScript, and the one thing this field is for -- refusing a page left
 * open across midnight -- only works if it says what the member saw. The
 * function refuses anything but today in Seoul.
 */
export class EarlyEventClaimDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;

  @ApiProperty({ example: '2026-08-31', description: 'The Asia/Seoul day the screen is showing' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'eventDate must be a YYYY-MM-DD date' })
  readonly eventDate!: string;
}
