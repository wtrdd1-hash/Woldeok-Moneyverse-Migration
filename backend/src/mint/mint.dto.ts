import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export enum SinkCategory {
  TAX = 'TAX',
  AUCTION_FEE = 'AUCTION_FEE',
  APPRAISAL_FEE = 'APPRAISAL_FEE',
  PROPERTY_TAX = 'PROPERTY_TAX',
  PENALTY = 'PENALTY',
  RETIRED_CURRENCY = 'RETIRED_CURRENCY',
}

export class CreateMintBatchDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d+$/, { message: 'amountWld must be a positive integer string' })
  amountWld!: string;

  @IsNotEmpty()
  @IsString()
  denomination!: string; // e.g. "1000", "5000", "10000", "50000"

  @IsNotEmpty()
  @IsString()
  mintReason!: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, { message: 'productionCostWld must be an integer string' })
  productionCostWld?: string;
}

export class BurnCurrencyDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d+$/, { message: 'amountWld must be a positive integer string' })
  amountWld!: string;

  @IsNotEmpty()
  @IsEnum(SinkCategory)
  sinkCategory!: SinkCategory;

  @IsNotEmpty()
  @IsString()
  burnReason!: string;

  @IsOptional()
  @IsString()
  proofTransactionId?: string;
}
