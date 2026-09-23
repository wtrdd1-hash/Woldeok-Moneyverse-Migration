import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UpdateCollectionPieceDto {
  @ApiPropertyOptional({ description: '수집품 유저 애착 메모 (최대 500자)', example: '첫 시즌 기념 훈장' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly userNote?: string;

  @ApiPropertyOptional({ description: '즐겨찾기 여부', example: true })
  @IsOptional()
  @IsBoolean()
  readonly isFavorite?: boolean;
}

export class AdvanceCurationDto {
  @ApiPropertyOptional({ description: '소유권 7단계 사다리 목표 단계 (1-7)', example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(7)
  readonly targetStep?: number;

  @ApiPropertyOptional({ description: 'D1~D7 타임라인 일차', example: 'D7', enum: ['D1', 'D3', 'D7'] })
  @IsOptional()
  @IsIn(['D1', 'D3', 'D7'])
  readonly timelineDay?: 'D1' | 'D3' | 'D7';
}
