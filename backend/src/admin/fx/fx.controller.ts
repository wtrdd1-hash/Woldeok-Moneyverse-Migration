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
  @ApiOperation({ summary: '외환보유액, SDR 다변화, 통화스왑, 선물환 및 EWS 텔레메트리 종합 조회' })
  async getStatus() {
    const [reserves, history, txs, sdrAllocations, swapAgreements, forwardContracts, ews] = await Promise.all([
      this.fxService.getReserveStatus(),
      this.fxService.getRateHistory(30),
      this.fxService.listTransactions(15),
      this.fxService.getSdrAllocations(),
      this.fxService.getSwapAgreements(),
      this.fxService.listAllForwardContracts(20),
      this.fxService.getEarlyWarningStatus(),
    ]);
    return {
      success: true,
      data: {
        reserves,
        history,
        txs,
        sdrAllocations,
        swapAgreements,
        forwardContracts,
        ews,
      },
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

  @Post('swaps/drawdown')
  @ApiOperation({ summary: '우방국 양자간 통화스왑 비상 자금 인출 및 외환보유액 공급' })
  async drawdownSwap(
    @Body() body: { agreementId: string; amountUsd: number; purpose?: string },
    @Req() req: RequestWithSession
  ) {
    const adminId = requireUserId(req);
    const result = await this.fxService.drawdownCurrencySwap(
      body.agreementId,
      Number(body.amountUsd),
      adminId,
      body.purpose
    );
    return {
      success: true,
      data: result,
      message: `통화스왑 $${Number(body.amountUsd).toLocaleString()} USD 긴급 인출 및 시장 공급이 집행되었습니다.`,
    };
  }

  @Post('forward/settle')
  @ApiOperation({ summary: '선물환(Forward) 계약 수동/만기 즉시 정산' })
  async settleForward(@Body() body: { contractId: string }) {
    const result = await this.fxService.settleForwardContract(body.contractId);
    return {
      success: true,
      data: result,
      message: `선물환 계약 정산 완료 (환급액: ${result.refundWld.toLocaleString()} WLD, 실현손익: ${result.contract.realizedPnlWld?.toLocaleString()} WLD)`,
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
  @ApiOperation({ summary: '대국민 실시간 서울외환시장 환율, 외환보유액, 통화스왑, SDR 다변화 및 EWS 공개 조회' })
  async getPublicPortalData() {
    const [reserves, history, sdrAllocations, swapAgreements, forwardRates, ews] = await Promise.all([
      this.fxService.getReserveStatus(),
      this.fxService.getRateHistory(30),
      this.fxService.getSdrAllocations(),
      this.fxService.getSwapAgreements(),
      this.fxService.getForwardRates(),
      this.fxService.getEarlyWarningStatus(),
    ]);

    const totalSwapFacilityUsd = swapAgreements.reduce((sum, a) => sum + a.totalFacilityUsd, 0);
    const availableSwapFacilityUsd = swapAgreements.reduce((sum, a) => sum + a.availableFacilityUsd, 0);

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
        sdrAllocations,
        swapSummary: {
          totalSwapFacilityUsd,
          availableSwapFacilityUsd,
          agreements: swapAgreements,
        },
        forwardRates,
        ews,
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

  @Get('forward/rates')
  @SkipInternalToken()
  @ApiOperation({ summary: '1M/3M/6M CIP 내외금리차 기반 이론 선물환율 조회' })
  async getForwardRates() {
    const rates = await this.fxService.getForwardRates();
    return { success: true, data: rates };
  }

  @Get('forward/my-contracts')
  @UseGuards(SessionGuard, AuthenticatedGuard)
  @ApiOperation({ summary: '내 선물환(Forward) 환헤지 체결 계약 목록 조회' })
  async getMyForwardContracts(@Req() req: RequestWithSession) {
    const userId = requireUserId(req);
    const contracts = await this.fxService.getUserForwardContracts(userId);
    return { success: true, data: contracts };
  }

  @Post('forward/contract')
  @UseGuards(SessionGuard, AuthenticatedGuard)
  @ApiOperation({ summary: '선물환(Forward) 환헤지 계약 체결 (10% 증거금)' })
  async createForwardContract(
    @Body() body: {
      position: 'BUY_USD' | 'SELL_USD';
      tenor: '1M' | '3M' | '6M';
      contractAmountUsd: number;
    },
    @Req() req: RequestWithSession
  ) {
    const userId = requireUserId(req);
    const contract = await this.fxService.createForwardContract(
      userId,
      body.position,
      body.tenor,
      Number(body.contractAmountUsd)
    );
    return {
      success: true,
      data: contract,
      message: `${body.tenor} 선물환 ${body.position === 'BUY_USD' ? '달러 매수 헤지' : '달러 매도 헤지'} 계약이 체결되었습니다. (증거금: ${contract.marginWld.toLocaleString()} WLD 예치)`,
    };
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
