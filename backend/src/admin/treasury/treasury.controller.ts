import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { SessionGuard } from '../../auth/guards/session.guard';
import type { RequestWithSession } from '../../auth/session.context';
import { requireUserId } from '../../auth/session.context';
import { TreasuryService } from './treasury.service';

export class TreasuryOperationDto {
  @ApiProperty({ example: 'VAULT_MAIN', description: '금고 코드' })
  @IsString()
  vaultCode!: string;

  @ApiProperty({ example: '1000000', description: '금액 (정수 WLD)' })
  @IsString()
  @Matches(/^\d+$/, { message: 'amountWld must be an integer string' })
  amountWld!: string;

  @ApiProperty({ example: '긴급 유동성 공급 및 통화 안정화 조치', description: '감사 사유 (최소 10자)' })
  @IsString()
  @MinLength(10, { message: 'reason must be at least 10 characters' })
  reason!: string;
}

export class TreasuryListQueryDto {
  @ApiProperty({ required: false, example: 30 })
  @IsOptional()
  limit?: number;

  @ApiProperty({ required: false, example: '2026-09-21T00:00:00.000Z' })
  @IsOptional()
  cursor?: string;
}

@ApiTags('Admin Treasury')
@Controller('admin/treasury')
@UseGuards(SessionGuard, ConsentGuard, AuthenticatedGuard, AdminGuard)
export class AdminTreasuryController {
  constructor(private readonly service: TreasuryService) {}

  @Get('overview')
  @ApiOperation({ summary: '중앙 국고 및 비축금 현황 대시보드 조회' })
  async getOverview() {
    return this.service.getOverview();
  }

  @Get('transactions')
  @ApiOperation({ summary: '국고 원장 입출금 및 순환 감사 내역 조회' })
  async listTransactions(@Query() query: TreasuryListQueryDto) {
    return this.service.listTransactions(query.limit, query.cursor);
  }

  @Post('inject')
  @ApiOperation({ summary: '국고 자금 긴급 주입 (Step-Up/Admin)' })
  async injectFunds(
    @Req() request: RequestWithSession,
    @Body() dto: TreasuryOperationDto,
  ) {
    const adminId = requireUserId(request);
    return this.service.injectFunds(adminId, dto.vaultCode, dto.amountWld, dto.reason);
  }

  @Post('drain')
  @ApiOperation({ summary: '국고 잉여 자금 영구 소각 (Step-Up/Admin)' })
  async absorbFunds(
    @Req() request: RequestWithSession,
    @Body() dto: TreasuryOperationDto,
  ) {
    const adminId = requireUserId(request);
    return this.service.absorbFunds(adminId, dto.vaultCode, dto.amountWld, dto.reason);
  }
}
