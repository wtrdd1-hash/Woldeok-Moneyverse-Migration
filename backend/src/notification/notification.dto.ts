import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export const NOTIFICATION_CATEGORIES = [
  'TRANSACTIONAL', 'PRODUCT_ACTIVITY', 'SEASON_LIVEOPS', 'SECURITY_CRITICAL',
  'BUSINESS', 'BANK', 'SEASON', 'SPACE', 'SECURITY', 'SYSTEM',
] as const;

export class NotificationQueryDto {
  @ApiPropertyOptional({ description: '서버가 기록한 실제 알림 분류' })
  @IsOptional()
  @IsIn(NOTIFICATION_CATEGORIES)
  category?: (typeof NOTIFICATION_CATEGORIES)[number];

  @ApiPropertyOptional({ description: '미확인 알림만 필터 여부', example: true })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === 'true' ? true : value === 'false' ? false : value)
  @IsBoolean()
  unreadOnly?: boolean;

  @ApiPropertyOptional({ description: '결과 제한 수', example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: '오프셋', example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(5000)
  offset?: number;
}
