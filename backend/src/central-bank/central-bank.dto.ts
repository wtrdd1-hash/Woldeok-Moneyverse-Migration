import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class AcceptMintBatchDto {
  @IsNotEmpty()
  @IsString()
  acceptanceReason!: string;

  @IsOptional()
  @IsString()
  targetVaultAllocation?: string; // e.g. "TREASURY_MAIN", "STABILIZATION_RESERVE"
}

export class UpdateBaseRateDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d+(\.\d{1,2})?$/, { message: 'baseRatePercent must be a decimal string e.g. 3.50' })
  baseRatePercent!: string;

  @IsNotEmpty()
  @IsString()
  rateDecisionRationale!: string;

  @IsOptional()
  @IsString()
  targetInflationPercent?: string;
}

export class UpdateReserveRequirementDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d+(\.\d{1,2})?$/, { message: 'reserveRatioPercent must be a decimal string e.g. 10.0' })
  reserveRatioPercent!: string;

  @IsNotEmpty()
  @IsString()
  regulationRationale!: string;
}
