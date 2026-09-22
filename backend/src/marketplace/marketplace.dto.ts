import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateListingDto {
  @ApiProperty({ description: '판매할 아이템 코드', example: 'frame_moonlight_emerald' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  itemCode!: string;

  @ApiProperty({ description: '판매 수량', example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  @Max(1000)
  quantity!: number;

  @ApiProperty({ description: '총 판매 가격 (WLD)', example: '500' })
  @IsString()
  @Matches(/^[1-9][0-9]*$/, { message: 'price must be a positive integer string' })
  price!: string;

  @ApiPropertyOptional({ description: '판매 물품 설명', example: '미사용 신품 프레임' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiProperty({ description: '멱등성 키 (UUID)', example: '00000000-0000-0000-0000-000000000000' })
  @IsUUID()
  idempotencyKey!: string;
}

export class BuyListingDto {
  @ApiProperty({ description: '멱등성 키 (UUID)', example: '00000000-0000-0000-0000-000000000000' })
  @IsUUID()
  idempotencyKey!: string;
}

export class MarketplaceQueryDto {
  @ApiPropertyOptional({ description: '카테고리 필터', example: 'frame' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: '검색 키워드', example: '에메랄드' })
  @IsOptional()
  @IsString()
  search?: string;

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
  offset?: number;
}
