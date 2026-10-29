import {
  Body,
  Controller,
  Get,
  Param,
  Post,
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
import { BurnCurrencyDto, CreateMintBatchDto } from './mint.dto';
import { MintService } from './mint.service';

import { unverifiedFinanceOperation } from '../economy/monetary/finance-hold';

@ApiTags('mint')
@Controller('mint')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard)
export class MintController {
  constructor(private readonly mintService: MintService) {}

  @Post('batches')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: '신규 본원통화(M0) 주조 요청 생성 (국가조폐국)' })
  async createMintBatch(
    @Body() _dto: CreateMintBatchDto,
    @Req() _req: RequestWithSession,
  ) {
    return unverifiedFinanceOperation('LEGACY_MONETARY_AUTHORITY');
  }

  @Get('batches')
  @ApiOperation({ summary: '조폐국 화폐 주조 배치 및 인수 상태 목록 조회' })
  async getBatches() {
    return unverifiedFinanceOperation('LEGACY_MONETARY_AUTHORITY');
  }

  @Get('batches/:id')
  @ApiOperation({ summary: '특정 주조 배치 상세 및 검증 해시 조회' })
  async getBatchById(@Param('id') _id: string) {
    return unverifiedFinanceOperation('LEGACY_MONETARY_AUTHORITY');
  }

  @Get('seigniorage')
  @ApiOperation({ summary: '조폐국 주조차익(시뇨리지) 및 통화 순환 원장 대시보드' })
  async getSeigniorageLedger() {
    return unverifiedFinanceOperation('LEGACY_MONETARY_AUTHORITY');
  }

  @Post('burn')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: '통화 영구 소각(Destroy/Sinks) 집행 및 공인 인증서 발행' })
  async burnCurrency(
    @Body() _dto: BurnCurrencyDto,
    @Req() _req: RequestWithSession,
  ) {
    return unverifiedFinanceOperation('LEGACY_MONETARY_AUTHORITY');
  }

  @Get('audit-certificates')
  @ApiOperation({ summary: '화폐 소각 및 주조 감사 공인 인증서 목록 조회' })
  async getAuditCertificates() {
    return unverifiedFinanceOperation('LEGACY_MONETARY_AUTHORITY');
  }
}
