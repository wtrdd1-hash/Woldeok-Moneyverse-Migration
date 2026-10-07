import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { SessionGuard } from '../../auth/guards/session.guard';
import { SkipInternalToken } from '../../auth/guards/skip-internal-token.decorator';
import type { RequestWithSession } from '../../auth/session.context';
import { requireUserId } from '../../auth/session.context';
import { TreasuryBondService } from './treasury-bond.service';

@ApiTags('Treasury Bonds & Sovereign Debt Management')
@Controller('admin/bonds')
@UseGuards(SessionGuard, ConsentGuard, AuthenticatedGuard, AdminGuard)
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
  async listCouponLogs(@Query('limit') limit?: number) {
    return this.service.listRecentCouponLogs(limit ? Number(limit) : 20);
  }

  @Post('distribute-coupons')
  @ApiOperation({ summary: '전체 유저 보유 국채 쿠폰 이자 즉시 일괄 정산 집행' })
  async distributeCoupons() {
    return this.service.processHourlyCouponsAndMaturities();
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
  @ApiOperation({ summary: '대국민 국채 상품 목록 및 실시간 수익률/잔여좌수 공시' })
  async getMarkets() {
    const [overview, bonds] = await Promise.all([
      this.service.getOverview(),
      this.service.listBonds(),
    ]);

    return {
      overview,
      bonds,
      guarantor: '월덱 중앙재정국고 (VAULT_MAIN) 원리금 100% 지급보증 (AAA Sovereign)',
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
}
