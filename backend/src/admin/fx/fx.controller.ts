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
import { FxService } from './fx.service';

@ApiTags('Foreign Exchange (FX) & Reserves Control')
@Controller('admin/fx')
@UseGuards(SessionGuard, ConsentGuard, AuthenticatedGuard, AdminGuard)
export class AdminFxController {
  constructor(private readonly fxService: FxService) {}

  @Get('status')
  @ApiOperation({ summary: '외환보유액 및 서울외환시장 전체 텔레메트리 조회' })
  async getStatus() {
    const [reserves, history, txs] = await Promise.all([
      this.fxService.getReserveStatus(),
      this.fxService.getRateHistory(30),
      this.fxService.listTransactions(15),
    ]);
    return {
      success: true,
      data: { reserves, history, txs },
    };
  }

  @Post('intervene')
  @ApiOperation({ summary: '중앙은행 외환당국 스무딩 오퍼레이션 시장개입 집행' })
  async intervene(
    @Body() body: { type: 'SELL_USD' | 'BUY_USD'; amountUsd?: number },
    @Req() req: RequestWithSession
  ) {
    const adminId = requireUserId(req);
    const amount = body.amountUsd ?? 50000;
    const result = await this.fxService.executeSmoothingIntervention(body.type, amount, adminId);
    return {
      success: true,
      data: result,
      message: '중앙은행 외환당국 스무딩 오퍼레이션 시장개입이 완료되었습니다.',
    };
  }

  @Post('halt')
  @ApiOperation({ summary: '외환시장 거래 긴급 일시정지(Halt) 킬스위치 제어' })
  async toggleHalt(@Body() body: { isHalted: boolean }, @Req() req: RequestWithSession) {
    const adminId = requireUserId(req);
    const result = await this.fxService.setHalt(body.isHalted, adminId);
    return {
      success: true,
      data: { isHalted: result },
      message: result ? '외환시장이 동결되었습니다.' : '외환시장이 정상 재개되었습니다.',
    };
  }
}

@ApiTags('Public Seoul FX Market Portal')
@Controller('fx')
export class PublicFxController {
  constructor(private readonly fxService: FxService) {}

  @Get('portal')
  @SkipInternalToken()
  @ApiOperation({ summary: '대국민 실시간 서울외환시장 환율 및 외환보유액 공개 조회' })
  async getPublicPortalData() {
    const [reserves, history] = await Promise.all([
      this.fxService.getReserveStatus(),
      this.fxService.getRateHistory(30),
    ]);
    return {
      success: true,
      data: {
        reserves: {
          currency: reserves.currency,
          totalReservesUsd: reserves.totalReservesUsd,
          currentRate: reserves.currentRate,
          targetAnchorRate: reserves.targetAnchorRate,
          isHalted: reserves.isHalted,
          updatedAt: reserves.updatedAt,
        },
        history,
      },
    };
  }

  @Get('my-wallet')
  @UseGuards(SessionGuard, AuthenticatedGuard)
  @ApiOperation({ summary: '내 가상 달러 외화 예금 지갑 조회' })
  async getMyWallet(@Req() req: RequestWithSession) {
    const userId = requireUserId(req);
    const wallet = await this.fxService.getUserWallet(userId);
    return { success: true, data: wallet };
  }

  @Post('swap/wld-to-usd')
  @UseGuards(SessionGuard, AuthenticatedGuard)
  @ApiOperation({ summary: 'WLD ➡️ USD 1초 즉시 환전' })
  async swapWldToUsd(@Body() body: { wldAmount: number }, @Req() req: RequestWithSession) {
    const userId = requireUserId(req);
    const result = await this.fxService.swapWldToUsd(userId, Number(body.wldAmount));
    return {
      success: true,
      data: result,
      message: `${body.wldAmount.toLocaleString()} WLD 환전 완료 ➡️ $${result.usdCredited.toLocaleString()} USD 지급`,
    };
  }

  @Post('swap/usd-to-wld')
  @UseGuards(SessionGuard, AuthenticatedGuard)
  @ApiOperation({ summary: 'USD ➡️ WLD 1초 즉시 환전' })
  async swapUsdToWld(@Body() body: { usdAmount: number }, @Req() req: RequestWithSession) {
    const userId = requireUserId(req);
    const result = await this.fxService.swapUsdToWld(userId, Number(body.usdAmount));
    return {
      success: true,
      data: result,
      message: `$${body.usdAmount.toLocaleString()} USD 환전 완료 ➡️ ${result.wldCredited.toLocaleString()} WLD 지급`,
    };
  }
}
