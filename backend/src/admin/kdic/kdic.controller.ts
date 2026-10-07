import {
  Body,
  Controller,
  Get,
  Post,
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
import { KdicService } from './kdic.service';

@ApiTags('Deposit Insurance (KDIC) & Financial Stability Control')
@Controller('admin/kdic')
@UseGuards(SessionGuard, ConsentGuard, AuthenticatedGuard, AdminGuard)
export class AdminKdicController {
  constructor(private readonly kdicService: KdicService) {}

  @Get('overview')
  @ApiOperation({ summary: '예금보험공사 기금 및 금융기관 건전성 총괄 관제' })
  async getOverview() {
    const data = await this.kdicService.getFundOverview();
    return { success: true, data };
  }

  @Post('assess-premiums')
  @ApiOperation({ summary: '부보 금융기관 분기별 예금보험료 정기 징수 집행' })
  async assessPremiums(@Req() req: RequestWithSession) {
    const adminId = requireUserId(req);
    const result = await this.kdicService.assessQuarterlyPremiums(adminId);
    return {
      success: true,
      data: result,
      message: `총 ${result.totalCollectedWld.toLocaleString()} WLD의 예금보험료가 기금에 적립되었습니다.`,
    };
  }

  @Post('liquidity-loan')
  @ApiOperation({ summary: '부실 우려 금융기관 긴급 유동성 대여(Bailout) 집행' })
  async injectLiquidity(
    @Body() body: { institutionId: string; amountWld: number },
    @Req() req: RequestWithSession
  ) {
    const adminId = requireUserId(req);
    const result = await this.kdicService.injectEmergencyLiquidity(
      body.institutionId,
      Number(body.amountWld),
      adminId
    );
    return {
      success: true,
      data: result,
      message: `금융기관 긴급 유동성 대여 완료 (회복 후 BIS: ${result.newBisRatioPct.toFixed(2)}%)`,
    };
  }

  @Post('payout')
  @ApiOperation({ summary: '파산 금융기관 피해 예금자 대위변제금 집행' })
  async executePayout(
    @Body() body: { institutionId: string; userId: string },
    @Req() req: RequestWithSession
  ) {
    const adminId = requireUserId(req);
    const result = await this.kdicService.executeDepositPayout(
      body.institutionId,
      body.userId,
      adminId
    );
    return {
      success: true,
      data: result,
      message: `피해 예금자 대위변제금 ${result.payoutAmountWld.toLocaleString()} WLD 즉시 환급 완료`,
    };
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
          institutionName: i.institutionName,
          institutionType: i.institutionType,
          bisRatioPct: i.bisRatioPct,
          soundnessGrade: i.soundnessGrade,
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
