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
import type { MonetaryOrderType, MonetaryTargetEnvelope } from './monetary.types';

@ApiTags('Admin Monetary & Central Bank')
@ApiBearerAuth()
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard)
@Controller('admin/economy/monetary')
export class MonetaryController {
  constructor(
    private readonly centralBank: CentralBankService,
    private readonly mintBureau: MintBureauService,
  ) {}

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
