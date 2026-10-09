import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { SessionGuard } from '../../auth/guards/session.guard';
import type { RequestWithSession } from '../../auth/session.context';
import { requireUserId } from '../../auth/session.context';
import { TreasuryService } from './treasury.service';
import { AutoSovereignWealthFundService } from './auto-swf.service';

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
  limit?: number;

  @ApiProperty({ required: false, example: '2026-09-21T00:00:00.000Z' })
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

@ApiTags('Admin Treasury')
@Controller('admin/treasury')
@UseGuards(SessionGuard, ConsentGuard, AuthenticatedGuard, AdminGuard)
export class AdminTreasuryController {
  constructor(
    private readonly service: TreasuryService,
    private readonly swfService?: AutoSovereignWealthFundService,
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
  @ApiOperation({ summary: '국고 세목별 수입 흐름 집계 조회' })
  async getRevenue() {
    return this.service.getRevenue();
  }

  @Get('expenditure')
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
    return this.service.listTransactions(query.limit, query.cursor);
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
    @Req() request: RequestWithSession,
    @Body() dto: TreasuryOperationDto,
  ) {
    const adminId = requireUserId(request);
    return this.service.injectFunds(adminId, dto.vaultCode, dto.amountWld, dto.reason);
  }

  @Post('drain')
  @ApiOperation({ summary: '국고 잉여 자금 영구 소각 (Step-Up/Admin)' })
  async absorbFunds(
    @Req() request: RequestWithSession,
    @Body() dto: TreasuryOperationDto,
  ) {
    const adminId = requireUserId(request);
    return this.service.absorbFunds(adminId, dto.vaultCode, dto.amountWld, dto.reason);
  }

  @Post('disburse/dividend')
  @ApiOperation({ summary: '시민 보편 배당 및 기본소득 환원금 일괄 집행 (Safe Reserve 30% Guard)' })
  async disburseDividend(
    @Req() request: RequestWithSession,
    @Body() dto: TreasuryDisburseDividendDto,
  ) {
    const adminId = requireUserId(request);
    return this.service.disburseCitizenDividend(adminId, dto.amountPerUserWld, dto.reason);
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
    @Req() request: RequestWithSession,
    @Body() dto: TreasuryDisburseTargetedSubsidyDto,
  ) {
    const adminId = requireUserId(request);
    return this.service.disburseTargetedSubsidy(
      adminId,
      dto.amountPerUserWld,
      dto.maxBalanceCutoffWld,
      dto.reason,
    );
  }

  @Post('donate')
  @ApiOperation({ summary: '시민 자발적 국고 기부 및 잉여 자금 흡수 (명예 칭호 수여)' })
  async userDonate(
    @Req() request: RequestWithSession,
    @Body() dto: TreasuryUserDonateDto,
  ) {
    const userId = requireUserId(request);
    return this.service.userDonate(userId, dto.amountWld, dto.memo || '국고 자발적 공공 기부');
  }

  @Get('donations/top')
  @ApiOperation({ summary: '국고 기부 명예의 전당 랭킹 조회' })
  async getTopDonors(@Query('limit') limit?: number) {
    return this.service.getTopDonors(limit ? Number(limit) : 10);
  }

  @Post('disburse/grant')
  @ApiOperation({ summary: '공공 프로젝트 펀딩 및 복지 보조금 지출 집행 (Safe Reserve 30% Guard)' })
  async disburseGrant(
    @Req() request: RequestWithSession,
    @Body() dto: TreasuryDisburseGrantDto,
  ) {
    const adminId = requireUserId(request);
    return this.service.disburseGrant(
      adminId,
      dto.targetUserId ?? null,
      dto.amountWld,
      dto.disbursementType,
      dto.reason,
    );
  }

  @Post('budget/distribute')
  @ApiOperation({ summary: '헌법적 4분할 목적별 예산 배정 집행 (복지40/인프라30/비상20/소각10)' })
  async distributeBudget(
    @Req() request: RequestWithSession,
    @Body() dto: TreasuryDistributeBudgetDto,
  ) {
    const adminId = requireUserId(request);
    return this.service.distributeBudgetRule(adminId, dto.amountWld, dto.reason);
  }

  @Post('buyback/burn')
  @ApiOperation({ summary: '룬스케이프형 역매수 영구소각 집행 (장터 덤핑 매물 국고 매입/소각)' })
  async buybackBurn(
    @Req() request: RequestWithSession,
    @Body() dto: TreasuryBuybackBurnDto,
  ) {
    const adminId = requireUserId(request);
    return this.service.executeMarketBuybackBurn(adminId, dto.listingId, dto.reason);
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
    @Req() request: RequestWithSession,
    @Body() dto: TreasuryExecuteWealthTaxDto,
  ) {
    const adminId = requireUserId(request);
    return this.service.executeWealthTax(adminId, dto.reason);
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
  @ApiOperation({ summary: '자율 국부펀드(ASWF) 포트폴리오 및 잉여 세수 재순환 현황 조회' })
  async getSwfStatus() {
    if (!this.swfService) {
      return { config: null, portfolios: [], events: [] };
    }
    const [config, portfolios, events] = await Promise.all([
      this.swfService.getConfig(),
      this.swfService.getPortfolios(),
      this.swfService.getRecentEvents(20),
    ]);
    return { config, portfolios, events };
  }

  @Post('swf/rebalance')
  @ApiOperation({ summary: '자율 국부펀드(ASWF) 잉여 세수 시장 재순환 즉시 집행' })
  async triggerSwfRebalance() {
    if (!this.swfService) {
      return { executed: false, reason: 'SWF_SERVICE_UNAVAILABLE' };
    }
    return this.swfService.evaluateAndRebalance();
  }

  @Post('swf/liquidate')
  @ApiOperation({ summary: '과도한 주식 투자 자산의 국고 현금 즉시 회수 환원' })
  async liquidateSwfToTreasury(@Body('targetPortfolioAumWld') targetPortfolioAumWld?: string) {
    if (!this.swfService) {
      return { success: false, reason: 'SWF_SERVICE_UNAVAILABLE' };
    }
    return this.swfService.liquidateToTreasuryVault(targetPortfolioAumWld);
  }

  @Put('swf/config')
  @ApiOperation({ summary: '자율 국부펀드(ASWF) 안전 준비금 및 투자 한도 튜닝' })
  async updateSwfConfig(@Body() body: Record<string, unknown>) {
    if (!this.swfService) {
      return { success: false };
    }
    return this.swfService.updateConfig(body);
  }
}

