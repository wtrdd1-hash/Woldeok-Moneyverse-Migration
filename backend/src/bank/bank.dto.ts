import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsString, IsUUID, Matches } from 'class-validator';

export class IdempotentDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class BankTransferDto {
  @ApiProperty({ example: '1000' })
  @Transform(({ value }) => (value !== null && value !== undefined ? String(value) : ''))
  @IsString()
  @IsNotEmpty()
  @Matches(/^[1-9][0-9]*$/, { message: 'amount must be a positive integer string' })
  readonly amount!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class BankBorrowSmartDto {
  @ApiProperty({ example: '5000' })
  @Transform(({ value }) => (value !== null && value !== undefined ? String(value) : ''))
  @IsString()
  @IsNotEmpty()
  @Matches(/^[1-9][0-9]*$/, { message: 'amount must be a positive integer string' })
  readonly amount!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class BankRepayDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly loanId!: string;

  @ApiProperty({ example: '1000' })
  @Transform(({ value }) => (value !== null && value !== undefined ? String(value) : ''))
  @IsString()
  @IsNotEmpty()
  @Matches(/^[1-9][0-9]*$/, { message: 'amount must be a positive integer string' })
  readonly amount!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class BankBondPurchaseDto {
  @ApiProperty({ enum: ['BOND_7D', 'BOND_30D'], example: 'BOND_7D' })
  @IsIn(['BOND_7D', 'BOND_30D'])
  readonly bondCode!: string;

  @ApiProperty({ example: '10000' })
  @Transform(({ value }) => (value !== null && value !== undefined ? String(value) : ''))
  @IsString()
  @IsNotEmpty()
  @Matches(/^[1-9][0-9]*$/, { message: 'amount must be a positive integer string' })
  readonly amount!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}
