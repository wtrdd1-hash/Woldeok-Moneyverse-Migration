import {
  Body,
  Controller,
  Get,
  Post,
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
import { NationalPensionService } from './national-pension.service';

@ApiTags('National Pension Service (NPS) & Social Fund')
@Controller('admin/pension')
@UseGuards(SessionGuard, ConsentGuard, AuthenticatedGuard, AdminGuard)
export class AdminNationalPensionController {
  constructor(private readonly service: NationalPensionService) {}

  @Get('overview')
  @ApiOperation({ summary: '국민연금 적립 기금(AUM), 총 가입자 수, 지급 통계 조회' })
  async getOverview() {
    return this.service.getOverview();
  }

  @Get('recent-payouts')
  @ApiOperation({ summary: '최근 정기 기초연금 지급 로그 조회' })
  async getRecentPayouts(@Query('limit') limit?: number) {
    return this.service.listRecentPayoutLogs(limit ? Number(limit) : 20);
  }

  @Post('distribute-payouts')
  @ApiOperation({ summary: '은퇴 연금 수령 대상자 대상 기초연금 일괄 수동 집행' })
  async distributePayouts() {
    return this.service.distributeHourlyPensionPayouts();
  }
}

@ApiTags('National Pension Service Public Portal')
@Controller('pension')
export class PublicNationalPensionController {
  constructor(private readonly service: NationalPensionService) {}

  @Get('overview')
  @SkipInternalToken()
  @ApiOperation({ summary: '대국민 국민연금 기금 운용 현황 및 벤치마크 지표 공개' })
  async getPublicOverview() {
    return this.service.getOverview();
  }

  @Get('my-account')
  @UseGuards(SessionGuard, AuthenticatedGuard)
  @ApiOperation({ summary: '내 국민연금 계좌, 적립금, 등급, 은퇴 수령 상태 조회' })
  async getMyAccount(@Req() req: RequestWithSession) {
    const userId = requireUserId(req);
    return this.service.getAccount(userId);
  }

  @Post('contribute')
  @UseGuards(SessionGuard, AuthenticatedGuard)
  @ApiOperation({ summary: '국민연금 기여금 납입 (지갑 차감 -> 국고 편입)' })
  async contribute(
    @Req() req: RequestWithSession,
    @Body('amountWld') amountWld: number,
    @Body('note') note?: string,
  ) {
    const userId = requireUserId(req);
    return this.service.contribute(userId, Number(amountWld), note);
  }

  @Post('toggle-retire')
  @UseGuards(SessionGuard, AuthenticatedGuard)
  @ApiOperation({ summary: '은퇴 연금 수령 개시 / 적립 모드 전환' })
  async toggleRetire(@Req() req: RequestWithSession) {
    const userId = requireUserId(req);
    return this.service.toggleRetirement(userId);
  }

  @Post('liquidate')
  @UseGuards(SessionGuard, AuthenticatedGuard)
  @ApiOperation({ summary: '국민연금 중도 해지 및 원금 95% 환급 청구' })
  async liquidate(@Req() req: RequestWithSession) {
    const userId = requireUserId(req);
    return this.service.liquidate(userId);
  }

  @Get('my-contributions')
  @UseGuards(SessionGuard, AuthenticatedGuard)
  @ApiOperation({ summary: '내 기여금 납입 내역 조회' })
  async getMyContributions(@Req() req: RequestWithSession) {
    const userId = requireUserId(req);
    return this.service.listContributions(userId);
  }

  @Get('my-payouts')
  @UseGuards(SessionGuard, AuthenticatedGuard)
  @ApiOperation({ summary: '내 기초연금 수령 내역 조회' })
  async getMyPayouts(@Req() req: RequestWithSession) {
    const userId = requireUserId(req);
    return this.service.listPayoutLogs(userId);
  }
}
