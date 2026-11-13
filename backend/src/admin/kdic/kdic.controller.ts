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
import { requireUserId } from '../../auth/session.context';
import { KdicService } from './kdic.service';
import { rejectUnverifiedKdicSettlement } from './kdic-ledger-hold';

@ApiTags('Deposit Insurance (KDIC) & Financial Stability Control')
@Controller('admin/kdic')
@UseGuards(SessionGuard, ConsentGuard, AuthenticatedGuard, AdminGuard, AdminSessionGuard)
export class AdminKdicController {
  constructor(private readonly kdicService: KdicService) {}

  @Get('overview')
  @ApiOperation({ summary: '예금보험공사 기금 및 금융기관 건전성 총괄 관제' })
  async getOverview(@Req() req: RequestWithSession) {
    const data = await this.kdicService.getFundOverview(requireUserId(req));
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
  async assessPremiums(@Req() req?: RequestWithSession) {
    rejectUnverifiedKdicSettlement();
    const actor = req?.session?.user_id ?? 'system';
    const data = await this.kdicService.assessQuarterlyPremiums(actor);
    return { success: true, data };
  }

  @Post('liquidity-loan')
  @UseGuards(CsrfGuard)
  @ApiResponse({ status: 503, description: 'KDIC_LEDGER_SETTLEMENT_UNVERIFIED: financial settlement suspended' })
  @ApiOperation({ summary: '긴급 유동성 대여 — 원장 검증 전 집행 보류' })
  async injectLiquidity(@Req() req?: RequestWithSession) {
    rejectUnverifiedKdicSettlement();
    const actor = req?.session?.user_id ?? 'system';
    const data = await this.kdicService.injectEmergencyLiquidity('BANK_COMMERCIAL', 1_000_000, actor);
    return { success: true, data };
  }

  @Post('payout')
  @UseGuards(CsrfGuard)
  @ApiResponse({ status: 503, description: 'KDIC_LEDGER_SETTLEMENT_UNVERIFIED: financial settlement suspended' })
  @ApiOperation({ summary: '대위변제 — 원장 검증 전 집행 보류' })
  async executePayout(@Req() req?: RequestWithSession) {
    rejectUnverifiedKdicSettlement();
    const actor = req?.session?.user_id ?? 'system';
    const data = await this.kdicService.executeDepositPayout('BANK_COMMERCIAL', 'member', actor);
    return { success: true, data };
  }

}

@ApiTags('Public KDIC Depositor Protection Portal')
@Controller('kdic')
export class PublicKdicController {
  constructor(private readonly kdicService: KdicService) {}

  @Get('portal')
  @SkipInternalToken()
  @ApiOperation({ summary: '대국민 예금자보호 제도 및 예보기금 공개 조회' })
  async getPublicPortalData() {
    const data = await this.kdicService.getFundOverview();
    return {
      success: true,
      data: {
        fund: {
          fundName: data.fund.fundName,
          totalFundWld: data.fund.totalFundWld,
          protectionLimitPerUser: data.fund.protectionLimitPerUser,
          totalInsuredDepositsWld: data.fund.totalInsuredDepositsWld,
          isEmergencyMode: data.fund.isEmergencyMode,
          updatedAt: data.fund.updatedAt,
        },
        institutions: data.institutions.map(i => ({
          id: i.id,
          institutionName: i.institutionName,
          institutionType: i.institutionType,
          bisRatioPct: i.bisRatioPct,
          soundnessGrade: i.soundnessGrade,
          totalDepositsWld: i.totalDepositsWld,
          premiumRatePct: i.premiumRatePct,
          status: i.status,
        })),
        summary: data.summary,
      },
    };
  }

  @Get('my-coverage')
  @UseGuards(SessionGuard, AuthenticatedGuard)
  @ApiOperation({ summary: '내 계좌별 예금자보호 한도 및 보호금액 조회' })
  async getMyCoverage(@Req() req: RequestWithSession) {
    const userId = requireUserId(req);
    const coverage = await this.kdicService.getUserCoverage(userId);
    return { success: true, data: coverage };
  }
}
