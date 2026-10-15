import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, Matches, MaxLength } from 'class-validator';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { SessionGuard } from '../../auth/guards/session.guard';
import type { RequestWithSession } from '../../auth/session.context';
import { requireUserId } from '../../auth/session.context';
import { TreasuryService } from './treasury.service';

export class TreasuryDonationV2Dto {
  @ApiProperty({ description: 'Idempotency UUID, unchanged on retry' })
  @IsUUID()
  idempotencyKey!: string;

  @ApiProperty({ description: 'Positive whole WLD amount as decimal string', example: '100' })
  @IsString()
  @Matches(/^[1-9][0-9]*$/)
  amountWld!: string;

  @ApiProperty({ required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  memo?: string;
}

@ApiTags('Treasury Donations')
@Controller('treasury')
@UseGuards(SessionGuard, ConsentGuard, AuthenticatedGuard)
export class TreasuryDonationController {
  constructor(private readonly treasury: TreasuryService) {}

  @Post('donations')
  @ApiOperation({ summary: 'Idempotent donation — paused until finance release gate' })
  donate(@Req() request: RequestWithSession, @Body() dto: TreasuryDonationV2Dto) {
    return this.treasury.donateVerified(
      requireUserId(request), dto.idempotencyKey, dto.amountWld, dto.memo ?? '',
    );
  }
}
