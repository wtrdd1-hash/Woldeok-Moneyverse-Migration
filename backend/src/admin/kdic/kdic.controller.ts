import {
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { AdminSessionGuard } from '../../auth/guards/admin-session.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { SessionGuard } from '../../auth/guards/session.guard';
import { SkipInternalToken } from '../../auth/guards/skip-internal-token.decorator';
import type { RequestWithSession } from '../../auth/session.context';
import { KdicService } from './kdic.service';
import { rejectUnverifiedKdicSettlement, rejectUnverifiedKdicCoverage } from './kdic-ledger-hold';

@ApiTags('Deposit Insurance (KDIC) & Financial Stability Control')
@Controller('admin/kdic')
@UseGuards(SessionGuard, ConsentGuard, AuthenticatedGuard, AdminGuard, AdminSessionGuard)
export class AdminKdicController {
  constructor(private readonly kdicService: KdicService) {}

  @Get('overview')
  @ApiOperation({ summary: '예금보험공사 기금 및 금융기관 건전성 총괄 관제' })
  async getOverview() {
    const data = await this.kdicService.getFundOverview();
    return { success: true, data };
  }

  @Get('ledger-integrity')
  @ApiOperation({ summary: 'Read-only canonical ledger projection, journal imbalance and Treasury link audit' })
  async getLedgerIntegrity() {
    const data = await this.kdicService.getLedgerIntegrity();
    return { success: true, data };
  }

  @Post('assess-premiums')
  @UseGuards(CsrfGuard)
  @ApiResponse({ status: 503, description: 'KDIC_LEDGER_SETTLEMENT_UNVERIFIED: financial settlement suspended' })
  @ApiOperation({ summary: '예보료 징수 — 원장 검증 전 집행 보류' })
  async assessPremiums() {
    rejectUnverifiedKdicSettlement();
  }

  @Post('liquidity-loan')
  @UseGuards(CsrfGuard)
  @ApiResponse({ status: 503, description: 'KDIC_LEDGER_SETTLEMENT_UNVERIFIED: financial settlement suspended' })
  @ApiOperation({ summary: '긴급 유동성 대여 — 원장 검증 전 집행 보류' })
  async injectLiquidity() {
    rejectUnverifiedKdicSettlement();
  }

  @Post('payout')
  @UseGuards(CsrfGuard)
  @ApiResponse({ status: 503, description: 'KDIC_LEDGER_SETTLEMENT_UNVERIFIED: financial settlement suspended' })
  @ApiOperation({ summary: '대위변제 — 원장 검증 전 집행 보류' })
  async executePayout() {
    rejectUnverifiedKdicSettlement();
  }

}

@ApiTags('Public KDIC Depositor Protection Portal')
@Controller('kdic')
export class PublicKdicController {
  constructor(private readonly kdicService: KdicService) {}

  @Get('portal')
  @SkipInternalToken()
  @ApiResponse({ status: 503, description: 'KDIC_COVERAGE_UNVERIFIED: virtual coverage not certified' })
  @ApiOperation({ summary: '가상 예금 보호 인증 보류 — 법적 보장이나 기금 잔액을 공개하지 않음' })
  async getPublicPortalData(): Promise<never> {
    rejectUnverifiedKdicCoverage();
  }

  @Get('my-coverage')
  @UseGuards(SessionGuard, AuthenticatedGuard)
  @ApiResponse({ status: 503, description: 'KDIC_COVERAGE_UNVERIFIED: owner coverage not certified' })
  @ApiOperation({ summary: '회원별 가상 보호금액 인증 보류' })
  async getMyCoverage(@Req() _req: RequestWithSession): Promise<never> {
    rejectUnverifiedKdicCoverage();
  }
}
