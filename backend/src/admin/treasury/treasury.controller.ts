import { AdminChannelOtpService } from "../../auth/admin-channel-otp.service";
import {
  BadRequestException,
  ServiceUnavailableException, UnauthorizedException,
  Body,
  Controller,
  Get,
  Header,
  Optional,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, Matches, MinLength } from 'class-validator';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { SessionGuard } from '../../auth/guards/session.guard';
import type { RequestWithSession } from '../../auth/session.context';
import { requireUserId } from '../../auth/session.context';
import { TreasuryService } from './treasury.service';
import { AutoSovereignWealthFundService, swfLedgerUnavailable } from './auto-swf.service';
import { decodeTreasuryLedgerCursor, parseTreasuryLedgerLimit } from './treasury-ledger-cursor';

export class TreasuryOperationDto {
  @ApiProperty({ example: 'VAULT_MAIN', description: '금고 코드' })
  @IsString()
  vaultCode!: string;

  @ApiProperty({ example: '1000000', description: '금액 (정수 WLD)' })
  @IsString()
  @Matches(/^\d+$/, { message: 'amountWld must be an integer string' })
  amountWld!: string;

  @ApiProperty({ example: '긴급 유동성 공급 및 통화 안정화 조치', description: '감사 사유 (최소 10자)' })
  @IsString()
  @MinLength(10, { message: 'reason must be at least 10 characters' })
  reason!: string;
}

export class TreasuryDisburseDividendDto {
  @ApiProperty({ example: '1000', description: '1인당 지급 배당금 (정수 WLD)' })
  @IsString()
  @Matches(/^\d+$/, { message: 'amountPerUserWld must be an integer string' })
  amountPerUserWld!: string;

  @ApiProperty({ example: '2026년 4분기 국고 세수 잉여금 시민 보편 환원 기본소득 배당', description: '감사 사유 (최소 10자)' })
  @IsString()
  @MinLength(10, { message: 'reason must be at least 10 characters' })
  reason!: string;
}

export class TreasuryDisburseTargetedSubsidyDto {
  @ApiProperty({ example: '5000', description: '1인당 배당금 (정수 WLD)' })
  @IsString()
  @Matches(/^\d+$/, { message: 'amountPerUserWld must be an integer string' })
  amountPerUserWld!: string;

  @ApiProperty({ example: '10000', description: '수혜 대상 최대 자산 컷오프 (정수 WLD)' })
  @IsString()
  @Matches(/^\d+$/, { message: 'maxBalanceCutoffWld must be an integer string' })
  maxBalanceCutoffWld!: string;

  @ApiProperty({ example: '저자산 초기 유저 정착금 및 빈곤 탈출 지원금 선별 집행', description: '감사 사유 (최소 10자)' })
  @IsString()
  @MinLength(10, { message: 'reason must be at least 10 characters' })
  reason!: string;
}

export class TreasuryUserDonateDto {
  @ApiProperty({ example: '10000', description: '기부 금액 (정수 WLD)' })
  @IsString()
  @Matches(/^\d+$/, { message: 'amountWld must be an integer string' })
  amountWld!: string;

  @ApiProperty({ required: false, example: '초기 유저 복지 기금 후원', description: '기부 메모' })
  @IsOptional()
  @IsString()
  memo?: string;

  @ApiProperty({ format: 'uuid', description: 'Retry-stable transaction key' })
  @IsUUID()
  idempotencyKey!: string;
}

export class TreasuryDisburseGrantDto {
  @ApiProperty({ required: false, example: '00000000-0000-0000-0000-000000000000', description: '수혜 대상 유저 ID (선택)' })
  @IsOptional()
  @IsString()
  targetUserId?: string;

  @ApiProperty({ example: '50000', description: '지원금 총액 (정수 WLD)' })
  @IsString()
  @Matches(/^\d+$/, { message: 'amountWld must be an integer string' })
  amountWld!: string;

  @ApiProperty({ example: 'COMMUNITY_FUNDING', description: '지출 유형 (COMMUNITY_FUNDING, WELFARE_SUBSIDY, MARKET_STIMULUS, PUBLIC_GRANT)' })
  @IsString()
  disbursementType!: string;

  @ApiProperty({ example: '도시 인프라 확충 및 공공 커뮤니티 공간 구축 보조금 집행', description: '감사 사유 (최소 10자)' })
  @IsString()
  @MinLength(10, { message: 'reason must be at least 10 characters' })
  reason!: string;
}

export class TreasuryListQueryDto {
  @ApiProperty({ required: false, example: 30 })
  @IsOptional()
  limit?: string;

  @ApiProperty({ required: false, description: 'Opaque tl1 cursor from the previous page; timestamp-only cursors are not accepted' })
  @IsOptional()
  cursor?: string;
}

export class TreasuryExecuteWealthTaxDto {
  @ApiProperty({ required: false, example: '초고액 자산가 누진적 부유세 정기 과세 집행', description: '과세 감사 사유 (선택)' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class TreasuryDistributeBudgetDto {
  @ApiProperty({ example: '1000000', description: '4분할 배정 총액 (정수 WLD)' })
  @IsString()
  @Matches(/^\d+$/, { message: 'amountWld must be an integer string' })
  amountWld!: string;

  @ApiProperty({ example: '2026년 4분기 목적별 금고(복지40%/인프라30%/비축20%/소각10%) 헌법적 예산 배정', description: '감사 사유 (최소 10자)' })
  @IsString()
  @MinLength(10, { message: 'reason must be at least 10 characters' })
  reason!: string;
}

export class TreasuryBuybackBurnDto {
  @ApiProperty({ example: '00000000-0000-0000-0000-000000000000', description: '장터 매물 ID (UUID)' })
  @IsString()
  listingId!: string;

  @ApiProperty({ example: '장터 최저가 덤핑 매물 국고 공개시장운영(OMO) 매입 및 즉시 영구소각을 통한 시세 방어', description: '감사 사유 (최소 10자)' })
  @IsString()
  @MinLength(10, { message: 'reason must be at least 10 characters' })
  reason!: string;
}

import { unverifiedFinanceOperation, unverifiedSwfSettlement } from '../../economy/monetary/finance-hold';

/** A public WLD disclosure requires a reconciled journal, not merely vault rows. */
function hasCertifiedTreasuryProof(overview: Awaited<ReturnType<TreasuryService['getOverview']>>): boolean {
  const proof = overview.reconciliation;
  if (proof?.status !== 'RECONCILED' || proof.discrepancy_amount_wld !== '0') return false;
  if (!/^\d+$/.test(proof.total_vaults_balance_wld ?? '') ||
      !/^\d+$/.test(proof.total_ledger_net_flow_wld ?? '') ||
      !/^\d+$/.test(overview.total_treasury_wld ?? '')) return false;
  if (proof.total_vaults_balance_wld !== overview.total_treasury_wld ||
      proof.total_ledger_net_flow_wld !== overview.total_treasury_wld) return false;
  if (typeof proof.last_reconciled_at !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(proof.last_reconciled_at)) return false;
  const verifiedAt = Date.parse(proof.last_reconciled_at);
  if (!Number.isFinite(verifiedAt) || verifiedAt > Date.now()) return false;
  try {
    const vaultTotal = overview.vaults.reduce((sum, vault) => sum + BigInt(vault.balance_wld), BigInt(0));
    return vaultTotal === BigInt(overview.total_treasury_wld);
  } catch {
    return false;
  }
}

/** Public disclosure exposes only the evidence-backed treasury overview projection. */
@ApiTags('Public Treasury')
@Controller('treasury')
export class PublicTreasuryController {
  constructor(private readonly service: TreasuryService) {}

  @Get('public-overview')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Public treasury overview from verified ledger evidence' })
  async getPublicOverview() {
    let overview: Awaited<ReturnType<TreasuryService['getOverview']>>;
    try {
      overview = await this.service.getOverview();
    } catch (error) {
      // A revoked DB read must not become an opaque 500 or expose SQL details.
      if (error instanceof ServiceUnavailableException) throw error;
      throw new ServiceUnavailableException('PUBLIC_TREASURY_RECONCILIATION_PENDING');
    }
    if (!hasCertifiedTreasuryProof(overview)) {
      throw new ServiceUnavailableException('PUBLIC_TREASURY_RECONCILIATION_PENDING');
    }
    return {
      success: true,
      total_treasury_wld: overview.total_treasury_wld,
      available_wld: overview.available_wld,
      reserve_wld: overview.reserve_wld,
      reserve_ratio_pct: overview.reserve_ratio_pct,
      vaults: overview.vaults.map((vault) => ({
        code: vault.code,
        name: vault.name,
        balance_wld: vault.balance_wld,
      })),
      timestamp: overview.reconciliation.last_reconciled_at,
    };
  }
}

@ApiTags('Admin Treasury')
@Controller('admin/treasury')
@UseGuards(SessionGuard, ConsentGuard, AuthenticatedGuard, AdminGuard)
export class AdminTreasuryController {
  constructor(
    private readonly service: TreasuryService,
    private readonly swfService?: AutoSovereignWealthFundService,
    @Optional() private readonly otpService?: AdminChannelOtpService,
  ) {}

  @Get('overview')
  @ApiOperation({ summary: '중앙 국고 및 비축금 현황 대시보드 조회' })
  async getOverview() {
    return this.service.getOverview();
  }

  @Get('tax-rates')
  @ApiOperation({ summary: '권위 국고 세율 및 과세표준 표 조회' })
  async getTaxRates() {
    return this.service.getTaxRates();
  }

  @Get('budgets')
  @ApiOperation({ summary: '국고 목적별 예산 배정 체계 및 소진 현황 조회' })
  async getBudgets() {
    return this.service.getBudgets();
  }

  @Get('revenue')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: '국고 세목별 수입 흐름 집계 조회' })
  async getRevenue() {
    return this.service.getRevenue();
  }

  @Get('expenditure')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: '국고 예산 목적별 지출 흐름 집계 조회' })
  async getExpenditure() {
    return this.service.getExpenditure();
  }

  @Get('reconciliation')
  @ApiOperation({ summary: '국고 금고 잔액 및 원장 대사 무결성 상태 조회' })
  async getReconciliation() {
    return this.service.getReconciliation();
  }

  @Get('transactions')
  @ApiOperation({ summary: '국고 원장 입출금 및 순환 감사 내역 조회' })
  async listTransactions(@Query() query: TreasuryListQueryDto) {
    const limit = parseTreasuryLedgerLimit(query.limit);
    if (query.cursor !== undefined) decodeTreasuryLedgerCursor(query.cursor);
    return this.service.listTransactions(limit, query.cursor);
  }

  @Get('user-money-flows')
  @ApiOperation({ summary: '전체 유저 자금 흐름(입출금/주식/상점/복식부기 원장) 실시간 조회' })
  async getUserMoneyFlows(
    @Query('limit') limit?: number,
    @Query('cursor') cursor?: string,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('direction') direction?: string,
  ) {
    return this.service.getUserMoneyFlows(limit, cursor, search, type, direction);
  }

  @Post('inject')
  @ApiOperation({ summary: '국고 자금 긴급 주입 (Step-Up/Admin)' })
  async injectFunds(
    @Req() _request: RequestWithSession,
    @Body() _dto: TreasuryOperationDto,
  ) {
    return unverifiedFinanceOperation('TREASURY_SETTLEMENT');
  }

  @Post('drain')
  @ApiOperation({ summary: '국고 잉여 자금 영구 소각 (Step-Up/Admin)' })
  async absorbFunds(
    @Req() _request: RequestWithSession,
    @Body() _dto: TreasuryOperationDto,
  ) {
    return unverifiedFinanceOperation('TREASURY_SETTLEMENT');
  }

  @Post('disburse/dividend')
  @ApiOperation({ summary: '시민 보편 배당 및 기본소득 환원금 일괄 집행 (Safe Reserve 30% Guard)' })
  async disburseDividend(
    @Req() _request: RequestWithSession,
    @Body() _dto: TreasuryDisburseDividendDto,
  ) {
    return unverifiedFinanceOperation('TREASURY_SETTLEMENT');
  }

  @Get('disburse/targeted-preview')
  @ApiOperation({ summary: '저자산 시민 선별 지원금 수혜자 수 및 소요 예산 시뮬레이션' })
  async previewTargetedSubsidy(
    @Query('cutoff') cutoff?: string,
    @Query('amount') amount?: string,
  ) {
    return this.service.previewTargetedSubsidy(cutoff || '10000', amount || '5000');
  }

  @Post('disburse/targeted')
  @ApiOperation({ summary: '저자산 초기 시민 타겟팅 국고 선별 지원금 집행 (Targeted Relief)' })
  async disburseTargetedSubsidy(
    @Req() _request: RequestWithSession,
    @Body() _dto: TreasuryDisburseTargetedSubsidyDto,
  ) {
    return unverifiedFinanceOperation('TREASURY_SETTLEMENT');
  }

  @Post('donate')
  @ApiOperation({ summary: '시민 자발적 국고 기부 및 잉여 자금 흡수 (명예 칭호 수여)' })
  async userDonate(
    @Req() _request: RequestWithSession,
    @Body() _dto: TreasuryUserDonateDto,
  ) {
    return unverifiedFinanceOperation('TREASURY_SETTLEMENT');
  }

  @Get('donations/top')
  @ApiOperation({ summary: '국고 기부 명예의 전당 랭킹 조회' })
  async getTopDonors(@Query('limit') limit?: string) {
    if (limit !== undefined && (typeof limit !== 'string' || !/^[1-9][0-9]*$/.test(limit))) {
      throw new BadRequestException('limit must be a decimal integer between 1 and 100');
    }
    const parsed = limit === undefined ? 10 : Number(limit);
    if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > 100) {
      throw new BadRequestException('limit must be a decimal integer between 1 and 100');
    }
    return this.service.getTopDonors(parsed);
  }

  @Post('disburse/grant')
  @ApiOperation({ summary: '공공 프로젝트 펀딩 및 복지 보조금 지출 집행 (Safe Reserve 30% Guard)' })
  async disburseGrant(
    @Req() _request: RequestWithSession,
    @Body() _dto: TreasuryDisburseGrantDto,
  ) {
    return unverifiedFinanceOperation('TREASURY_SETTLEMENT');
  }

  @Post('budget/distribute')
  @ApiOperation({ summary: '헌법적 4분할 목적별 예산 배정 집행 (복지40/인프라30/비상20/소각10)' })
  async distributeBudget(
    @Req() _request: RequestWithSession,
    @Body() _dto: TreasuryDistributeBudgetDto,
  ) {
    return unverifiedFinanceOperation('TREASURY_SETTLEMENT');
  }

  @Post('buyback/burn')
  @ApiOperation({ summary: '룬스케이프형 역매수 영구소각 집행 (장터 덤핑 매물 국고 매입/소각)' })
  async buybackBurn(
    @Req() _request: RequestWithSession,
    @Body() _dto: TreasuryBuybackBurnDto,
  ) {
    return unverifiedFinanceOperation('TREASURY_SETTLEMENT');
  }

  @Get('governance/votes')
  @ApiOperation({ summary: '시민 거버넌스 예산안 투표 집계 현황 조회' })
  async getGovernanceVotes(@Query('quarter') quarter?: string) {
    return this.service.getGovernanceVotes(quarter || '2026-Q4');
  }

  @Get('export/csv')
  @ApiOperation({ summary: '국고 회계 원장 불변 기록 CSV 내보내기' })
  async exportCsv() {
    return {
      csv: await this.service.exportLedgerCsv(),
      exported_at: new Date().toISOString(),
    };
  }

  @Post('tax/wealth')
  @ApiOperation({ summary: '초고액 자산가 누진적 부유세 과세 일괄 집행 (복지기금 전액 적립)' })
  async executeWealthTax(
    @Req() _request: RequestWithSession,
    @Body() _dto: TreasuryExecuteWealthTaxDto,
  ) {
    return unverifiedFinanceOperation('TREASURY_SETTLEMENT');
  }

  @Get('tax/wealth')
  @ApiOperation({ summary: '누진적 부유세 과세 대상 및 이력 조회' })
  async getWealthTaxAssessments() {
    return this.service.getWealthTaxAssessments();
  }

  @Get('backup/status')
  @ApiOperation({ summary: '무료 클라우드 스토리지 백업 아카이빙 쿼터 및 무결성 상태 조회' })
  async getBackupStatus() {
    return this.service.getBackupStatus();
  }

  @Post('backup/snapshot')
  @ApiOperation({ summary: '무료 클라우드 스토리지 불변 원장 백업 스냅샷 수동 발행' })
  async createBackupSnapshot(
    @Req() request: RequestWithSession,
    @Body('provider') provider?: string,
  ) {
    const adminId = requireUserId(request);
    return this.service.createBackupSnapshot(adminId, provider);
  }

  @Get('swf')
  @Header('Cache-Control', 'private, no-store')
  @ApiOperation({ summary: '자율 국부펀드(ASWF) 포트폴리오 및 잉여 세수 재순환 현황 조회' })
  async getSwfStatus(@Req() request: RequestWithSession) {
    // The application role cannot SELECT private SWF base tables. Database
    // function admin_swf_snapshot checks the signed-in actor's admin role.
    const actorId = requireUserId(request);
    if (!this.swfService) {
      throw new ServiceUnavailableException({
        code: 'SWF_EVIDENCE_UNAVAILABLE',
        message: 'Administrator SWF snapshot service is unavailable',
      });
    }
    return this.swfService.getAdminSnapshot(actorId);
  }

  @Post('swf/rebalance')
  @UseGuards(CsrfGuard)
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: '국고 복리 성장 국부펀드(ASWF) 포트폴리오 리밸런싱 및 복리 성장 실행' })
  async triggerSwfRebalance(@Req() request?: RequestWithSession) {
    const actorId = request?.session?.user_id;
    if (!actorId) {
      return unverifiedSwfSettlement();
    }
    if (!this.swfService) {
      throw new ServiceUnavailableException({ code: 'SWF_SERVICE_UNAVAILABLE' });
    }
    return this.swfService.evaluateAndRebalance(actorId);
  }

  @Post('swf/liquidate')
  @UseGuards(CsrfGuard)
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: '과도한 주식 투자 자산의 국고 현금 즉시 회수 환원' })
  async liquidateSwfToTreasury(
    @Req() request?: RequestWithSession,
    @Body('targetPortfolioAumWld') targetPortfolioAumWld?: string,
  ) {
    const actorId = request?.session?.user_id;
    if (!actorId) {
      return unverifiedSwfSettlement();
    }
    if (!this.swfService) {
      throw new ServiceUnavailableException({ code: 'SWF_SERVICE_UNAVAILABLE' });
    }
    return this.swfService.liquidateToTreasuryVault(actorId, targetPortfolioAumWld);
  }

  @Put('swf/config')
  @UseGuards(CsrfGuard)
  @Header('Cache-Control', 'private, no-store')
  @ApiOperation({ summary: '자율 국부펀드(ASWF) 안전 준비금 및 투자 한도 튜닝' })
  async updateSwfConfig(
    @Req() request: RequestWithSession,
    @Body() body: Record<string, unknown>,
  ) {
    const actorId = requireUserId(request);
    if (!this.swfService) {
      throw new ServiceUnavailableException({ code: 'SWF_GOVERNANCE_UNAVAILABLE' });
    }
    return this.swfService.updateConfig(body, actorId);
  }

  @Get('health-insurance')
  @Header('Cache-Control', 'private, no-store')
  @ApiOperation({ summary: '국민건강보험(NHI) 공단 재정 및 납부/급여 원장 현황 조회' })
  async getHealthInsuranceOverview() {
    return this.service.getHealthInsuranceOverview();
  }

}

/** Guarded donation is isolated from anonymous public overview DI and disclosure. */
@ApiTags('Member Treasury')
@Controller('treasury')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
export class FundedTreasuryDonationController {
  constructor(
    private readonly service: TreasuryService,
    @Optional() private readonly otpService?: AdminChannelOtpService,
  ) {}

  @Post('donate')
  @Header('Cache-Control', 'private, no-store')
  @ApiOperation({ summary: '인증된 회원이 자신의 실제 WLD를 국고에 기부 (정식 복식원장·멱등 영수증)' })
  async userDonate(@Req() req: RequestWithSession, @Body() dto: TreasuryUserDonateDto) {
    return this.service.userDonate(
      requireUserId(req), dto.amountWld, dto.memo ?? '국고 자발적 공공 기부', dto.idempotencyKey,
    );
  }

  @Post('health-insurance/claim')
  @Header('Cache-Control', 'private, no-store')
  @ApiOperation({ summary: '인증된 회원의 법정 건강보험 혜택/치료비 지원금 청구 (복지기금 70% 지원)' })
  async claimHealthInsuranceBenefit(
    @Req() req: RequestWithSession,
    @Body() body: { claimType: string; expenseWld: string; reason: string },
  ) {
    const userId = requireUserId(req);
    return this.service.claimHealthInsuranceBenefit(
      userId,
      body.claimType || 'FATIGUE_RECOVERY',
      body.expenseWld,
      body.reason || '작업 피로도 회복 및 의료 지원',
    );
  }


  @Get("grants")
  @UseGuards(AuthenticatedGuard, AdminGuard)
  @Header("Cache-Control", "private, no-store")
  @ApiOperation({ summary: "관리자 창업 지원금 신청서 전체 목록 조회" })
  async listTreasuryGrants() {
    const applications = await this.service.listTreasuryGrants();
    return { ok: true, applications };
  }

  @Post("grants/:id/review")
  @UseGuards(AuthenticatedGuard, AdminGuard, CsrfGuard)
  @Header("Cache-Control", "private, no-store")
  @ApiOperation({ summary: "관리자 창업 지원금 심사 승인 또는 반려 처리" })
  async reviewTreasuryGrant(
    @Req() req: RequestWithSession,
    @Param("id") grantId: string,
    @Body() body: { action: "APPROVE" | "REJECT"; amountWld?: string; vaultCode?: string; reviewNote?: string },
  ) {
    const adminId = requireUserId(req);
    if (body.action === "APPROVE") {
      const result = await this.service.reviewGrantApprove(
        adminId,
        grantId,
        body.amountWld || "500000",
        body.vaultCode || "VAULT_WELFARE",
        body.reviewNote || "창업 지원금 승인 및 원자적 국고 지급",
      );
      return { ok: true, message: "창업 지원금이 복식부기로 국고 지급 승인되었습니다.", result };
    } else {
      const result = await this.service.reviewGrantReject(
        adminId,
        grantId,
        body.reviewNote || "사업계획서 요건 미충족으로 인한 반려",
      );
      return { ok: true, message: "창업 지원금 신청이 반려 처리되었습니다.", result };
    }
  }

  @Post("grants/clawback")
  @UseGuards(AuthenticatedGuard, AdminGuard, CsrfGuard)
  @Header("Cache-Control", "private, no-store")
  @ApiOperation({ summary: "관리자 14일 경과 미창업 지원금 즉시 환수(Sweep Now) 집행" })
  async clawbackTreasuryGrants(@Req() req: RequestWithSession) {
    const adminId = requireUserId(req);
    const result = await this.service.runClawbackSweepNow(adminId);
    return {
      ok: true,
      message: "미창업 환수 스윕이 성공적으로 집행되었습니다. (회수 건수: " + result.reclaimed_count + "건, 회수 총액: " + result.total_reclaimed_wld + " WLD)",
      result,
    };
  }

  @Post("grants/apply")
  @Header("Cache-Control", "private, no-store")
  @ApiOperation({ summary: "시민 창업 지원금 신청서 접수 및 1차 AI 스코어링" })
  async applyTreasuryGrant(
    @Req() req: RequestWithSession,
    @Body() body: { applicantName: string; businessName: string; businessPlan: string; category?: string; tier?: string },
  ) {
    const userId = requireUserId(req);
    const result = await this.service.applyGrant(
      userId,
      body.applicantName || "익명 창업자",
      body.businessName,
      body.businessPlan,
      body.category || "FINTECH",
      body.tier || "TIER_1_SEED",
    );
    return { ok: true, message: "창업 지원금 신청서가 성공적으로 접수되었습니다.", result };
  }

  @Get("grants/my")
  @Header("Cache-Control", "private, no-store")
  @ApiOperation({ summary: "본인 창업 지원금 신청 상태 조회" })
  async getMyTreasuryGrant(@Req() req: RequestWithSession) {
    const userId = requireUserId(req);
    const grant = await this.service.getUserGrant(userId);
    return { ok: true, grant };
  }

  @Post("salary/disburse")
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: "국고 관리자 임금 복식부기 실지급" })
  async disburseAdminSalary(
    @Req() req: RequestWithSession,
    @Body() body: { targetAdminId: string; amountWld: string; reason: string; otpCode?: string },
  ) {
    const actorId = requireUserId(req);
    if (this.otpService) {
      if (!body.otpCode || !this.otpService.verifyOtp(actorId, body.otpCode)) {
        throw new UnauthorizedException("관리자 텔레그램/디스코드 2FA OTP 인증 코드가 올바르지 않거나 만료되었습니다.");
      }
    }
    const result = await this.service.disburseAdminSalary(actorId, body.targetAdminId, body.amountWld, body.reason);
    return { ok: true, message: "관리자 임금이 성공적으로 국고에서 지급되었습니다.", result };
  }

  @Post("mint-topup")
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: "조폐국 화폐발행으로 국고 직접 충전" })
  async topupFromMintDirect(
    @Req() req: RequestWithSession,
    @Body() body: { amountWld: string; reason: string; requestKey: string; otpCode?: string },
  ) {
    const actorId = requireUserId(req);
    if (this.otpService) {
      if (!body.otpCode || !this.otpService.verifyOtp(actorId, body.otpCode)) {
        throw new UnauthorizedException("관리자 텔레그램/디스코드 2FA OTP 인증 코드가 올바르지 않거나 만료되었습니다.");
      }
    }
    const result = await this.service.topupFromMintDirect(actorId, body.amountWld, body.reason, body.requestKey);
    return { ok: true, message: "조폐국 신규 화폐가 국고로 성공적으로 발행 전입되었습니다.", result };
  }

}
