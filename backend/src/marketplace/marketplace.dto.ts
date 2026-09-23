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

export class CreateAuctionDto {
  @ApiProperty({ description: '아이템 코드', example: 'ITEM_TROPHY_GOLD' })
  @IsString()
  @IsNotEmpty()
  itemCode!: string;

  @ApiProperty({ description: '아이템 이름', example: '골드 메달' })
  @IsString()
  @IsNotEmpty()
  itemName!: string;

  @ApiProperty({ description: '카테고리', example: 'display' })
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiProperty({ description: '희귀도', example: 'LEGENDARY' })
  @IsString()
  @IsNotEmpty()
  rarity!: string;

  @ApiProperty({ description: '시작 호가 (WLD)', example: '5000' })
  @IsString()
  @Matches(/^[1-9][0-9]*$/, { message: 'startPriceWld must be a positive integer string' })
  startPriceWld!: string;

  @ApiPropertyOptional({ description: '즉시 낙찰가 (WLD)', example: '15000' })
  @IsOptional()
  @IsString()
  @Matches(/^[1-9][0-9]*$/, { message: 'buyNowPriceWld must be a positive integer string' })
  buyNowPriceWld?: string;

  @ApiPropertyOptional({ description: '경매 진행 시간(분)', example: 45, default: 45 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10080)
  durationMinutes?: number;

  @ApiPropertyOptional({ description: '설명' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class BidAuctionDto {
  @ApiProperty({ description: '입찰 호가 (WLD)', example: '8500' })
  @IsString()
  @Matches(/^[1-9][0-9]*$/, { message: 'bidAmountWld must be a positive integer string' })
  bidAmountWld!: string;
}

export class CreateTradeDto {
  @ApiProperty({ description: '상대방 닉네임', example: '무역상인_박' })
  @IsString()
  @IsNotEmpty()
  recipientName!: string;

  @ApiPropertyOptional({ description: '제공할 물품 목록', example: [] })
  @IsOptional()
  offeredItems?: Array<{ name: string; quantity: number; rarity?: string }>;

  @ApiPropertyOptional({ description: '제공할 WLD', example: '1000', default: '0' })
  @IsOptional()
  @IsString()
  offeredWld?: string;

  @ApiPropertyOptional({ description: '요청할 물품 목록', example: [] })
  @IsOptional()
  requestedItems?: Array<{ name: string; quantity: number }>;

  @ApiPropertyOptional({ description: '요청할 WLD', example: '500', default: '0' })
  @IsOptional()
  @IsString()
  requestedWld?: string;
}

export class RequestAppraisalDto {
  @ApiProperty({ description: '소장품 아이템 ID', example: 'item_trophy_01' })
  @IsString()
  @IsNotEmpty()
  itemId!: string;

  @ApiProperty({ description: '소장품 아이템명', example: '골드 메달' })
  @IsString()
  @IsNotEmpty()
  itemName!: string;

  @ApiProperty({ description: '희귀도', example: 'EPIC' })
  @IsString()
  @IsNotEmpty()
  rarity!: string;
}

