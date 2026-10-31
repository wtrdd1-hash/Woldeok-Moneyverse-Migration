import {
  ServiceUnavailableException,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { AdminSessionGuard } from '../../auth/guards/admin-session.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { ReauthGuard } from '../../auth/guards/reauth.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { SessionGuard } from '../../auth/guards/session.guard';
import { SkipInternalToken } from '../../auth/guards/skip-internal-token.decorator';
import { KdicService } from './kdic.service';
import { rejectUnverifiedKdicSettlement } from './kdic-ledger-hold';

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
  @UseGuards(CsrfGuard, ReauthGuard)
  @ApiResponse({ status: 503, description: 'KDIC_LEDGER_SETTLEMENT_UNVERIFIED: financial settlement suspended' })
  @ApiOperation({ summary: '예보료 징수 — 원장 검증 전 집행 보류' })
  async assessPremiums() {
    rejectUnverifiedKdicSettlement();
  }

  @Post('liquidity-loan')
  @UseGuards(CsrfGuard, ReauthGuard)
  @ApiResponse({ status: 503, description: 'KDIC_LEDGER_SETTLEMENT_UNVERIFIED: financial settlement suspended' })
  @ApiOperation({ summary: '긴급 유동성 대여 — 원장 검증 전 집행 보류' })
  async injectLiquidity() {
    rejectUnverifiedKdicSettlement();
  }

  @Post('payout')
  @UseGuards(CsrfGuard, ReauthGuard)
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
  @ApiResponse({ status: 503, description: 'KDIC_COVERAGE_UNVERIFIED: no certified insurance fund or payout guarantee' })
  @ApiOperation({ summary: 'Public insurance portal unavailable until ledger-backed coverage can be verified' })
  async getPublicPortalData(): Promise<never> {
    // The legacy fund and institution tables do not certify an enforceable payout.
    throw new ServiceUnavailableException({ code: 'KDIC_COVERAGE_UNVERIFIED' });
  }

  @Get('my-coverage')
  @UseGuards(SessionGuard, AuthenticatedGuard)
  @ApiResponse({ status: 503, description: 'KDIC_COVERAGE_UNVERIFIED: owner payout coverage cannot be certified' })
  @ApiOperation({ summary: 'Member coverage unavailable until owner-scoped ledger proof exists' })
  async getMyCoverage(): Promise<never> {
    // A wallet/cash/escrow sum is not a bank deposit insurance receipt.
    throw new ServiceUnavailableException({ code: 'KDIC_COVERAGE_UNVERIFIED' });
  }
}
