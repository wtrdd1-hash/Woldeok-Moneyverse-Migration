import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { AdminSessionGuard } from '../../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { SessionGuard } from '../../auth/guards/session.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { SkipInternalToken } from '../../auth/guards/skip-internal-token.decorator';
import type { RequestWithSession } from '../../auth/session.context';
import { requireUserId } from '../../auth/session.context';
import { TreasuryBondService } from './treasury-bond.service';
import { BOND_REPO_LOAN_HOLD_REASON } from './bond-repo-loan-hold';

@ApiTags('Treasury Bonds & Sovereign Debt Management')
@Controller('admin/bonds')
@UseGuards(SessionGuard, ConsentGuard, AuthenticatedGuard, AdminGuard, AdminSessionGuard)
export class AdminTreasuryBondController {
  constructor(private readonly service: TreasuryBondService) {}

  @Get('overview')
  @ApiOperation({ summary: '국채 발행 잔액, 조달 총액, 가중평균 금리 지표 조회' })
  async getOverview() {
    return this.service.getOverview();
  }

  @Get('list')
  @ApiOperation({ summary: '발행 국채 전체 목록 및 상태 조회' })
  async listBonds() {
    return this.service.listBonds();
  }

  @Get('coupon-logs')
  @ApiOperation({ summary: '국채 이자 지급 및 만기 상환 이력 조회' })
  async listCouponLogs(@Query('limit') limit?: string) {
    if (limit === undefined) return this.service.listRecentCouponLogs(20);
    if (typeof limit !== 'string' || !/^[1-9][0-9]*$/.test(limit)) {
      throw new BadRequestException('limit must be a decimal integer between 1 and 100');
    }
    const parsed = Number(limit);
    if (!Number.isSafeInteger(parsed) || parsed > 100) {
      throw new BadRequestException('limit must be a decimal integer between 1 and 100');
    }
    return this.service.listRecentCouponLogs(parsed);
  }

  @Post('distribute-coupons')
  @ApiOperation({ summary: '전체 유저 보유 국채 쿠폰 이자 즉시 일괄 정산 집행' })
  async distributeCoupons() {
    // Manual payouts must not bypass the uncertified ledger and idempotency gates.
    throw new ServiceUnavailableException('Manual bond settlement is on hold pending ledger certification');
  }

  @Put(':id/status')
  @ApiOperation({ summary: '국채 운영 상태 및 표면금리 변경 (동결/마감 제어)' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('annualCouponRateBps') annualCouponRateBps?: number,
  ) {
    return {
      success: await this.service.updateBondStatus(id, status, annualCouponRateBps),
      id,
      status,
    };
  }
}

@ApiTags('Public Treasury Bonds Exchange')
@Controller('bonds')
export class PublicTreasuryBondController {
  constructor(private readonly service: TreasuryBondService) {}

  @Get('markets')
  @SkipInternalToken()
  @ApiOperation({ summary: '게임 내 가상 WLD 채권 상품 및 서버 조회 시점 금리/잔여좌수' })
  async getMarkets() {
    const [overview, bonds] = await Promise.all([
      this.service.getOverview(),
      this.service.listBonds(),
    ]);

    return {
      overview,
      bonds,
      guarantor: '게임 내 가상 WLD 채권이며 실제 국가채권이나 금융상품이 아닙니다. 국가 신용등급 및 원리금 보증이 적용되지 않습니다.',
      disclosed_at: new Date().toISOString(),
    };
  }

  @Get('my-holdings')
  @UseGuards(SessionGuard, AuthenticatedGuard)
  @ApiOperation({ summary: '내 보유 국채 계좌, 누적 이자 수취액 및 만기 현황 조회' })
  async getMyHoldings(@Req() req: RequestWithSession) {
    const userId = requireUserId(req);
    return this.service.listUserHoldings(userId);
  }

  @Post('subscribe')
  @UseGuards(SessionGuard, AuthenticatedGuard)
  @ApiOperation({ summary: '국채 직접 청약 매수 (덕지갑 차감 -> 국채 발행)' })
  async subscribeBond(
    @Req() req: RequestWithSession,
    @Body('bondId') bondId: string,
    @Body('units') units: number,
  ) {
    const userId = requireUserId(req);
    return this.service.subscribeBond(userId, bondId, Number(units));
  }

  @Get('my-repo-loans')
  @UseGuards(SessionGuard, AuthenticatedGuard)
  @ApiOperation({ summary: '내 국채 담보 레포 대출 내역 조회' })
  async getMyRepoLoans(@Req() req: RequestWithSession) {
    const userId = requireUserId(req);
    return this.service.listUserRepoLoans(userId);
  }

  @Post('repo-loans/borrow')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
  @ApiResponse({ status: 503, description: 'Repo-loan borrowing is held until balanced ledger settlement is certified' })
  @ApiOperation({ summary: 'Repo-loan borrowing (ledger safety hold)' })
  async borrowRepoLoan() {
    throw new ServiceUnavailableException(BOND_REPO_LOAN_HOLD_REASON);
  }

  @Post('repo-loans/repay')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
  @ApiResponse({ status: 503, description: 'Repo-loan repayment is held until balanced ledger settlement is certified' })
  @ApiOperation({ summary: 'Repo-loan repayment (ledger safety hold)' })
  async repayRepoLoan() {
    throw new ServiceUnavailableException(BOND_REPO_LOAN_HOLD_REASON);
  }

  @Put('holdings/:id/rollover')
  @UseGuards(SessionGuard, AuthenticatedGuard)
  @ApiOperation({ summary: '만기 시 원금 자동 롤오버 재투자 설정 토글' })
  async toggleAutoRollover(
    @Req() req: RequestWithSession,
    @Param('id') id: string,
    @Body('enabled') enabled: boolean,
  ) {
    const userId = requireUserId(req);
    return {
      success: await this.service.toggleAutoRollover(userId, id, Boolean(enabled)),
      holdingId: id,
      autoRollover: enabled,
    };
  }
}
