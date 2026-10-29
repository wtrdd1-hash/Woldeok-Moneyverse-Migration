import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import {
  AcceptMintBatchDto,
  UpdateBaseRateDto,
  UpdateReserveRequirementDto,
} from './central-bank.dto';
import { CentralBankService } from './central-bank.service';

import { unverifiedFinanceOperation } from '../economy/monetary/finance-hold';

@ApiTags('central-bank')
@Controller('central-bank')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
export class CentralBankController {
  constructor(private readonly centralBankService: CentralBankService) {}

  @Post('mint-batches/:id/accept')
  @UseGuards(AdminGuard, CsrfGuard)
  @ApiOperation({ summary: '조폐국 주조 화폐 인수 및 국고/시중 유통 승인 (중앙은행 2단계 견제)' })
  async acceptMintBatch(
    @Param('id') _batchId: string,
    @Body() _dto: AcceptMintBatchDto,
    @Req() _req: RequestWithSession,
  ) {
    return unverifiedFinanceOperation('LEGACY_MONETARY_AUTHORITY');
  }

  @Get('monetary-aggregates')
  @ApiOperation({ summary: 'M0(본원통화), M1(협의통화), M2(광의통화) 거시경제 통화량 및 통화승수 조회' })
  async getMonetaryAggregates() {
    return unverifiedFinanceOperation('LEGACY_MONETARY_AUTHORITY');
  }

  @Get('base-rate')
  @ApiOperation({ summary: '현재 국가 기준금리(Base Rate) 및 테일러 룰 추정 금리 조회' })
  async getBaseRate() {
    return unverifiedFinanceOperation('LEGACY_MONETARY_AUTHORITY');
  }

  @Put('base-rate')
  @UseGuards(AdminGuard, CsrfGuard)
  @ApiOperation({ summary: '국가 기준금리(Base Rate) 결정 및 공시 (금융통화위원회)' })
  async updateBaseRate(
    @Body() _dto: UpdateBaseRateDto,
    @Req() _req: RequestWithSession,
  ) {
    return unverifiedFinanceOperation('LEGACY_MONETARY_AUTHORITY');
  }

  @Get('reserve-requirement')
  @ApiOperation({ summary: '시중 상업은행 법정 지급준비율(Reserve Requirement Ratio) 조회' })
  async getReserveRequirement() {
    return unverifiedFinanceOperation('LEGACY_MONETARY_AUTHORITY');
  }

  @Put('reserve-requirement')
  @UseGuards(AdminGuard, CsrfGuard)
  @ApiOperation({ summary: '시중 상업은행 법정 지급준비율 갱신 및 공시' })
  async updateReserveRequirement(
    @Body() _dto: UpdateReserveRequirementDto,
    @Req() _req: RequestWithSession,
  ) {
    return unverifiedFinanceOperation('LEGACY_MONETARY_AUTHORITY');
  }

  @Get('commercial-rates')
  @ApiOperation({ summary: '기준금리 및 지급준비율 연동 시중 상업은행 예대금리(대출/적금) 시뮬레이션 조회' })
  async getCommercialRates() {
    return unverifiedFinanceOperation('LEGACY_MONETARY_AUTHORITY');
  }
}
