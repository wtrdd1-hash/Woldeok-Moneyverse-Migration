import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class ActivityEventItemDto {
  @ApiProperty({ description: 'Client-generated idempotency identifier' })
  @IsUUID()
  readonly eventId!: string;

  @ApiProperty({ description: 'Event type: page_view, page_dwell, button_click' })
  @IsString()
  @IsIn(['page_view', 'page_dwell', 'button_click', 'form_submit', 'navigation'])
  readonly eventType!: string;

  @ApiProperty({ description: 'Target path or URL route' })
  @IsString()
  @MaxLength(500)
  readonly path!: string;

  @ApiPropertyOptional({ description: 'Button label or element identifier' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  readonly targetLabel?: string;

  @ApiPropertyOptional({ description: 'Dwell duration in milliseconds' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(86400000) // 24 hours max
  readonly dwellTimeMs?: number;

  @ApiPropertyOptional({ description: 'Client session identifier' })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  readonly sessionId?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  readonly metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Client timestamp' })
  @IsOptional()
  @IsString()
  readonly createdAt?: string;
}

export class IngestActivityEventsDto {
  @ApiProperty({ type: [ActivityEventItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActivityEventItemDto)
  readonly events!: ActivityEventItemDto[];
}

export class QueryActivityLogsDto {
  @ApiPropertyOptional({ default: 50, minimum: 1, maximum: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  readonly limit: number = 50;

  @ApiPropertyOptional({ default: 0, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  readonly offset: number = 0;

  @ApiPropertyOptional({ description: 'Filter by event type' })
  @IsOptional()
  @IsString()
  readonly eventType?: string;

  @ApiPropertyOptional({ description: 'Filter by user UUID' })
  @IsOptional()
  @IsUUID()
  readonly userId?: string;
}
