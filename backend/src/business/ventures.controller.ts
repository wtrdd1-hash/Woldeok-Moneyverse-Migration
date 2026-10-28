import {
  Body,
  Controller,
  Get,
  Header,
  Inject,
  Param,
  Post,
  ServiceUnavailableException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsIn, IsInt, IsPositive, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';

export class InvestVentureDto {
  @ApiProperty({ description: '투자할 스타트업 피치 ID', example: 'pitch-ai-01' })
  @IsString()
  readonly pitchId!: string;

  @ApiProperty({ description: '엔젤투자 금액 (WLD)', example: 500000 })
  @IsInt()
  @IsPositive()
  readonly amountWld!: number;

  @ApiProperty({ format: 'uuid', description: '클라이언트 소유 멱등성 키' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class ApplyVentureFounderDto {
  @ApiProperty({ description: '스타트업 이름', example: '네오 퀀트 랩스' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  readonly startupName!: string;

  @ApiProperty({ description: '산업 섹터', example: 'AI/핀테크' })
  @IsString()
  readonly sector!: string;

  @ApiProperty({ description: '목표 펀딩 금액 (WLD)', example: 50000000 })
  @IsInt()
  @IsPositive()
  readonly targetFundingWld!: number;

  @ApiProperty({ description: '지분 제공률 (%)', example: 15 })
  @IsInt()
  @IsPositive()
  readonly equitySharePercent!: number;

  @ApiProperty({ description: '사업 및 피치 설명' })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  readonly description!: string;

  @ApiProperty({ format: 'uuid', description: '클라이언트 소유 멱등성 키' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class ClaimDividendDto {
  @ApiProperty({ description: '투자 포트폴리오 ID', example: 'inv-001' })
  @IsString()
  readonly investmentId!: string;

  @ApiProperty({ format: 'uuid', description: '클라이언트 소유 멱등성 키' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export interface VenturePitch {
  id: string;
  name: string;
  sector: string;
  stage: 'SEED' | 'SERIES_A' | 'PRE_IPO';
  founderName: string;
  targetFundingWld: number;
  currentFundingWld: number;
  investorCount: number;
  equitySharePercent: number;
  expectedAnnualYieldPercent: number;
  daysRemaining: number;
  description: string;
}

export interface VentureInvestment {
  id: string;
  userId: string;
  pitchId: string;
  startupName: string;
  investedAmountWld: number;
  equitySharePercent: number;
  totalDividendsClaimedWld: number;
  unclaimedDividendsWld: number;
  investedAt: string;
}

@ApiTags('ventures')
@Controller('businesses/ventures')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
export class VenturesController {
  private evidenceUnavailable(): never {
    throw new ServiceUnavailableException({
      code: 'VENTURE_EVIDENCE_UNAVAILABLE',
      message: 'Verified venture funding and owner-scoped equity ledger receipts are unavailable.',
    });
  }

  @ApiOperation({ summary: '현재 크라우드펀딩 진행 중인 스타트업 피치 목록 조회' })
  @Header('Cache-Control', 'no-store')
  @Get('pitches')
  async listPitches() {
    // No persisted, audited funding source exists. A fabricated market is not an empty market.
    return this.evidenceUnavailable();
  }

  @ApiOperation({ summary: '내 VC 엔젤투자 포트폴리오 및 배당금 현황 조회' })
  @Header('Cache-Control', 'no-store')
  @Get('investments')
  async listMyInvestments(@Req() req: RequestWithSession) {
    requireUserId(req);
    // Member-bound sample holdings are not verified equity or claimable dividends.
    return this.evidenceUnavailable();
  }

  @ApiOperation({ summary: '스타트업 피치 엔젤투자 집행 (SAFE 지분 취득)' })
  @Post('invest')
  async investVenture(
    @Req() req: RequestWithSession,
    @Body() dto: InvestVentureDto,
  ) {
    throw new ServiceUnavailableException('시뮬레이션 기능입니다. 실제 자금 정산 및 상태 변경은 지원되지 않습니다.');
  }

  @ApiOperation({ summary: '스타트업 분기 배당금 즉시 수령 (지갑 입금)' })
  @Post('claim-dividend')
  async claimDividend(
    @Req() req: RequestWithSession,
    @Body() dto: ClaimDividendDto,
  ) {
    throw new ServiceUnavailableException('시뮬레이션 기능입니다. 실제 자금 정산 및 상태 변경은 지원되지 않습니다.');
  }

  @ApiOperation({ summary: '창업자 스타트업 펀딩 피치 신규 등록 신청' })
  @Post('apply-founder')
  async applyFounderPitch(
    @Req() req: RequestWithSession,
    @Body() dto: ApplyVentureFounderDto,
  ) {
    throw new ServiceUnavailableException('시뮬레이션 기능입니다. 실제 자금 정산 및 상태 변경은 지원되지 않습니다.');
  }
}
