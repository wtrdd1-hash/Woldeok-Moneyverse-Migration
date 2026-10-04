import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { SessionGuard } from '../../auth/guards/session.guard';
import type { RequestWithSession } from '../../auth/session.context';
import { requireUserId } from '../../auth/session.context';
import { CentralBankService } from './central-bank.service';
import { MintBureauService } from './mint-bureau.service';
import { AutoMonetaryRegulationService } from './auto-monetary-regulation.service';
import type { MonetaryOrderType, MonetaryTargetEnvelope } from './monetary.types';

@ApiTags('Admin Monetary & Central Bank')
@ApiBearerAuth()
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard)
@Controller('admin/economy/monetary')
export class MonetaryController {
  constructor(
    private readonly centralBank: CentralBankService,
    private readonly mintBureau: MintBureauService,
    private readonly autoRegulation: AutoMonetaryRegulationService,
  ) {}

  @Get('auto-regulation/status')
  @ApiOperation({ summary: '화폐량 자동 조절 엔진 설정 및 상태 조회' })
  async getAutoRegulationStatus() {
    const config = await this.autoRegulation.getConfig();
    const events = await this.autoRegulation.getRecentEvents(10);
    return { config, events };
  }

  @Post('auto-regulation/update')
  @ApiOperation({ summary: '화폐량 자동 조절 설정값 변경' })
  async updateAutoRegulation(
    @Body()
    body: {
      is_enabled?: boolean;
      target_faucet_sink_ratio?: number;
      tolerance_band_pct?: number;
      max_step_pct?: number;
      circuit_breaker_freeze_pct?: number;
    },
  ) {
    return this.autoRegulation.updateConfig(
      body.is_enabled,
      body.target_faucet_sink_ratio,
      body.tolerance_band_pct,
      body.max_step_pct,
      body.circuit_breaker_freeze_pct,
    );
  }

  @Post('auto-regulation/run')
  @ApiOperation({ summary: '화폐량 자동 조절 즉시 1회 수동 평가 및 집행' })
  async runAutoRegulationManually(@Req() req: RequestWithSession) {
    const adminId = requireUserId(req);
    const event = await this.autoRegulation.evaluateAndExecute(adminId);
    return { event };
  }

  @Get('auto-regulation/events')
  @ApiOperation({ summary: '화폐량 자동 조절 집행 타임라인 로그 목록' })
  async getAutoRegulationEvents(@Query('limit') limit?: number) {
    return this.autoRegulation.getRecentEvents(limit ? Number(limit) : 20);
  }

  @Get('ai-council/recommendation')
  @ApiOperation({ summary: 'AI 정책 위원회 거시 분석 권고안 미리보기' })
  async getAiCouncilRecommendation() {
    return this.centralBank.generateAiCouncilRecommendation();
  }

  @Post('ai-council/propose-policy')
  @ApiOperation({ summary: 'AI 정책 위원회 권고안 기반 통화정책 명령서 자동 등록 (PROPOSED)' })
  async proposeFromAiCouncil(@Req() req: RequestWithSession) {
    const adminId = requireUserId(req);
    const order = await this.centralBank.proposeFromAiCouncil(adminId);
    return { order };
  }

  @Get('telemetry')
  @ApiOperation({ summary: '통화정책 및 중앙은행-조폐국 텔레메트리 대사 집계' })
  async getTelemetry() {
    return this.centralBank.getMonetaryTelemetry();
  }

  @Get('orders')
  @ApiOperation({ summary: '중앙은행 통화정책 명령서 목록 조회' })
  async listOrders(@Query('limit') limit?: number) {
    return this.centralBank.listPolicyOrders(limit ? Number(limit) : 20);
  }

  @Post('orders/propose')
  @ApiOperation({ summary: '신규 통화정책 명령서 발의 (PROPOSED)' })
  async proposeOrder(
    @Req() req: RequestWithSession,
    @Body()
    body: {
      order_type: MonetaryOrderType;
      target_envelope: MonetaryTargetEnvelope;
      max_amount_wld: string;
      reason: string;
      valid_duration_hours?: number;
    },
  ) {
    const adminId = requireUserId(req);
    return this.centralBank.proposePolicyOrder(
      adminId,
      body.order_type,
      body.target_envelope,
      body.max_amount_wld,
      body.reason,
      body.valid_duration_hours,
    );
  }

  @Post('orders/:id/approve')
  @ApiOperation({ summary: '통화정책 명령서 공식 승인 (APPROVED)' })
  async approveOrder(@Req() req: RequestWithSession, @Param('id') orderId: string) {
    const adminId = requireUserId(req);
    return this.centralBank.approvePolicyOrder(adminId, orderId);
  }

  @Post('freeze')
  @ApiOperation({ summary: '신규 통화 발행 긴급 동결' })
  async freeze(@Req() req: RequestWithSession, @Body('reason') reason: string) {
    const adminId = requireUserId(req);
    return this.centralBank.freezeIssuance(adminId, reason);
  }

  @Post('unfreeze')
  @ApiOperation({ summary: '통화 발행 긴급 동결 해제' })
  async unfreeze(@Req() req: RequestWithSession) {
    const adminId = requireUserId(req);
    return this.centralBank.unfreezeIssuance(adminId);
  }

  @Get('certificates/mints')
  @ApiOperation({ summary: '조폐국 정식 발행 인증서 목록 조회' })
  async listMints(@Query('limit') limit?: number) {
    return this.mintBureau.listMintCertificates(limit ? Number(limit) : 20);
  }

  @Get('certificates/retirements')
  @ApiOperation({ summary: '조폐국 정식 소각 인증서 목록 조회' })
  async listRetirements(@Query('limit') limit?: number) {
    return this.mintBureau.listRetirementCertificates(limit ? Number(limit) : 20);
  }

  @Post('execute-mint')
  @ApiOperation({ summary: '승인된 명령에 따른 조폐국 정식 발행 실행' })
  async executeMint(
    @Req() req: RequestWithSession,
    @Body()
    body: {
      policy_order_id: string;
      amount_wld: string;
      recipient_user_id?: string | null;
      idempotency_key: string;
    },
  ) {
    const adminId = requireUserId(req);
    return this.mintBureau.executeAuthorizedMint(
      adminId,
      body.policy_order_id,
      body.amount_wld,
      body.recipient_user_id ?? null,
      body.idempotency_key,
    );
  }
}
