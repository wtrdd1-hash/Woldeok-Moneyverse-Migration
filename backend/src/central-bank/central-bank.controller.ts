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
import { requireUserId } from '../auth/session.context';
import {
  AcceptMintBatchDto,
  UpdateBaseRateDto,
  UpdateReserveRequirementDto,
} from './central-bank.dto';
import { CentralBankService } from './central-bank.service';

@ApiTags('central-bank')
@Controller('central-bank')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard)
export class CentralBankController {
  constructor(private readonly centralBankService: CentralBankService) {}

  @Post('mint-batches/:id/accept')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: '조폐국 주조 화폐 인수 및 국고/시중 유통 승인 (중앙은행 2단계 견제)' })
  async acceptMintBatch(
    @Param('id') batchId: string,
    @Body() dto: AcceptMintBatchDto,
    @Req() req: RequestWithSession,
  ) {
    const adminId = requireUserId(req);
    return this.centralBankService.acceptMintBatch(batchId, dto, adminId);
  }

  @Get('monetary-aggregates')
  @ApiOperation({ summary: 'M0(본원통화), M1(협의통화), M2(광의통화) 거시경제 통화량 및 통화승수 조회' })
  async getMonetaryAggregates() {
    return this.centralBankService.getMonetaryAggregates();
  }

  @Get('base-rate')
  @ApiOperation({ summary: '현재 국가 기준금리(Base Rate) 및 테일러 룰 추정 금리 조회' })
  async getBaseRate() {
    return this.centralBankService.getBaseRate();
  }

  @Put('base-rate')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: '국가 기준금리(Base Rate) 결정 및 공시 (금융통화위원회)' })
  async updateBaseRate(
    @Body() dto: UpdateBaseRateDto,
    @Req() req: RequestWithSession,
  ) {
    const adminId = requireUserId(req);
    return this.centralBankService.updateBaseRate(dto, adminId);
  }

  @Get('reserve-requirement')
  @ApiOperation({ summary: '시중 상업은행 법정 지급준비율(Reserve Requirement Ratio) 조회' })
  async getReserveRequirement() {
    return this.centralBankService.getReserveRequirement();
  }

  @Put('reserve-requirement')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: '시중 상업은행 법정 지급준비율 갱신 및 공시' })
  async updateReserveRequirement(
    @Body() dto: UpdateReserveRequirementDto,
    @Req() req: RequestWithSession,
  ) {
    const adminId = requireUserId(req);
    return this.centralBankService.updateReserveRequirement(dto, adminId);
  }

  @Get('commercial-rates')
  @ApiOperation({ summary: '기준금리 및 지급준비율 연동 시중 상업은행 예대금리(대출/적금) 시뮬레이션 조회' })
  async getCommercialRates() {
    return this.centralBankService.getCommercialBankRates();
  }
}
