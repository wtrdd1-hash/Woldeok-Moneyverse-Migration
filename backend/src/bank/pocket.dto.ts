import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreatePocketDto {
  @ApiProperty({ description: '저금통 이름', example: '비상금 통장' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  name!: string;

  @ApiProperty({ description: '목표 저축 금액 (WLD)', example: '50000' })
  @IsString()
  @Matches(/^[1-9][0-9]*$/, { message: 'targetAmount must be a positive integer string' })
  targetAmount!: string;

  @ApiPropertyOptional({ description: '목표 달성 예정일 (YYYY-MM-DD)', example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @ApiPropertyOptional({ description: '테마 색상 코드', example: '#10B981' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  themeColor?: string;

  @ApiPropertyOptional({ description: '아이콘 코드', example: 'piggy_bank' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  iconCode?: string;

  @ApiProperty({ description: '멱등성 키 (UUID)', example: '00000000-0000-0000-0000-000000000000' })
  @IsUUID()
  idempotencyKey!: string;
}

export class TransferPocketDto {
  @ApiProperty({ description: '이체 방향 (deposit: 본계좌->저금통, withdraw: 저금통->본계좌)', enum: ['deposit', 'withdraw'] })
  @IsIn(['deposit', 'withdraw'])
  direction!: 'deposit' | 'withdraw';

  @ApiProperty({ description: '이체 금액 (WLD)', example: '1000' })
  @IsString()
  @Matches(/^[1-9][0-9]*$/, { message: 'amount must be a positive integer string' })
  amount!: string;

  @ApiProperty({ description: '멱등성 키 (UUID)', example: '00000000-0000-0000-0000-000000000000' })
  @IsUUID()
  idempotencyKey!: string;
}

export class CustomizePocketDto {
  @ApiPropertyOptional({ description: '저금통 이름', example: '내집마련 통장' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  name?: string;

  @ApiPropertyOptional({ description: '목표 저축 금액 (WLD)', example: '100000' })
  @IsOptional()
  @IsString()
  @Matches(/^[1-9][0-9]*$/, { message: 'targetAmount must be a positive integer string' })
  targetAmount?: string;

  @ApiPropertyOptional({ description: '목표 달성 예정일 (YYYY-MM-DD)', example: '2027-06-30' })
  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @ApiPropertyOptional({ description: '테마 색상 코드', example: '#6366F1' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  themeColor?: string;

  @ApiPropertyOptional({ description: '아이콘 코드', example: 'home' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  iconCode?: string;
}

export class ArchivePocketDto {
  @ApiProperty({ description: '멱등성 키 (UUID)', example: '00000000-0000-0000-0000-000000000000' })
  @IsUUID()
  idempotencyKey!: string;
}
