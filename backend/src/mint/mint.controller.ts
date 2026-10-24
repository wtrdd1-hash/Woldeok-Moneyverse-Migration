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
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { BurnCurrencyDto, CreateMintBatchDto } from './mint.dto';
import { MintService } from './mint.service';

@ApiTags('mint')
@Controller('mint')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard)
export class MintController {
  constructor(private readonly mintService: MintService) {}

  @Post('batches')
  @UseGuards(CsrfGuard, ReauthGuard)
  @ApiOperation({ summary: '신규 본원통화(M0) 주조 요청 생성 (국가조폐국)' })
  async createMintBatch(
    @Body() dto: CreateMintBatchDto,
    @Req() req: RequestWithSession,
  ) {
    const adminId = requireUserId(req);
    return this.mintService.createMintBatch(dto, adminId);
  }

  @Get('batches')
  @ApiOperation({ summary: '조폐국 화폐 주조 배치 및 인수 상태 목록 조회' })
  async getBatches() {
    return this.mintService.getBatches();
  }

  @Get('batches/:id')
  @ApiOperation({ summary: '특정 주조 배치 상세 및 검증 해시 조회' })
  async getBatchById(@Param('id') id: string) {
    return this.mintService.getBatchById(id);
  }

  @Get('seigniorage')
  @ApiOperation({ summary: '조폐국 주조차익(시뇨리지) 및 통화 순환 원장 대시보드' })
  async getSeigniorageLedger() {
    return this.mintService.getSeigniorageLedger();
  }

  @Post('burn')
  @UseGuards(CsrfGuard, ReauthGuard)
  @ApiOperation({ summary: '통화 영구 소각(Destroy/Sinks) 집행 및 공인 인증서 발행' })
  async burnCurrency(
    @Body() dto: BurnCurrencyDto,
    @Req() req: RequestWithSession,
  ) {
    const adminId = requireUserId(req);
    return this.mintService.burnCurrency(dto, adminId);
  }

  @Get('audit-certificates')
  @ApiOperation({ summary: '화폐 소각 및 주조 감사 공인 인증서 목록 조회' })
  async getAuditCertificates() {
    return this.mintService.getAuditCertificates();
  }
}
