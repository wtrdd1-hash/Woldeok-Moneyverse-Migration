import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
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
  private mockPitches: VenturePitch[] = [
    {
      id: 'pitch-ai-01',
      name: '뉴럴 오토트레이드 랩스',
      sector: 'AI/퀀트 핀테크',
      stage: 'SEED',
      founderName: '알고마스터 (Lv.88)',
      targetFundingWld: 50000000,
      currentFundingWld: 38500000,
      investorCount: 142,
      equitySharePercent: 12.5,
      expectedAnnualYieldPercent: 24.8,
      daysRemaining: 5,
      description: '초고속 틱 데이터 분산 머신러닝 기반 가상 선물 오토트레이딩 솔루션',
    },
    {
      id: 'pitch-meta-02',
      name: '메타버스 테헤란 랜드 스튜디오',
      sector: '가상 부동산/엔터',
      stage: 'SERIES_A',
      founderName: '랜드로드 (Lv.95)',
      targetFundingWld: 120000000,
      currentFundingWld: 96000000,
      investorCount: 310,
      equitySharePercent: 18.0,
      expectedAnnualYieldPercent: 31.5,
      daysRemaining: 12,
      description: '월덕 메타버스 특별구역 초고층 복합 타워 설계 및 임대 수익 분배 DAO',
    },
    {
      id: 'pitch-game-03',
      name: '사이버 룰렛 VR 엔진',
      sector: '게임/웹3 카지노',
      stage: 'PRE_IPO',
      founderName: '카지노킹 (Lv.99)',
      targetFundingWld: 300000000,
      currentFundingWld: 285000000,
      investorCount: 890,
      equitySharePercent: 8.5,
      expectedAnnualYieldPercent: 42.0,
      daysRemaining: 2,
      description: '검증 가능한 공정성(Provably Fair) 기반 인터랙티브 카지노 VR 엔진',
    },
  ];

  @ApiOperation({ summary: '현재 크라우드펀딩 진행 중인 스타트업 피치 목록 조회' })
  @Get('pitches')
  async listPitches() {
    return {
      pitches: this.mockPitches,
      totalActivePitches: this.mockPitches.length,
      timestamp: new Date().toISOString(),
    };
  }

  @ApiOperation({ summary: '내 VC 엔젤투자 포트폴리오 및 배당금 현황 조회' })
  @Get('investments')
  async listMyInvestments(@Req() req: RequestWithSession) {
    const actorUserId = requireUserId(req);
    const investments: VentureInvestment[] = [
      {
        id: 'inv-001',
        userId: actorUserId,
        pitchId: 'pitch-ai-01',
        startupName: '뉴럴 오토트레이드 랩스',
        investedAmountWld: 2500000,
        equitySharePercent: 0.625,
        totalDividendsClaimedWld: 150000,
        unclaimedDividendsWld: 48500,
        investedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
      },
    ];
    return {
      investments,
      totalInvestedWld: 2500000,
      totalUnclaimedDividendsWld: 48500,
    };
  }

  @ApiOperation({ summary: '스타트업 피치 엔젤투자 집행 (SAFE 지분 취득)' })
  @Post('invest')
  async investVenture(
    @Req() req: RequestWithSession,
    @Body() dto: InvestVentureDto,
  ) {
    const actorUserId = requireUserId(req);
    const pitch = this.mockPitches.find((p) => p.id === dto.pitchId) ?? this.mockPitches[0]!;
    const equityPct = Number(((dto.amountWld / pitch.targetFundingWld) * pitch.equitySharePercent).toFixed(4));

    const receipt = {
      investmentId: `inv-${dto.idempotencyKey.slice(0, 8)}`,
      userId: actorUserId,
      pitchId: dto.pitchId,
      startupName: pitch.name,
      investedAmountWld: dto.amountWld,
      acquiredEquityPercent: equityPct,
      investedAt: new Date().toISOString(),
    };

    return {
      success: true,
      receipt,
      message: `${pitch.name}에 ${dto.amountWld.toLocaleString()} WLD 엔젤투자가 성공적으로 집행되었습니다.`,
    };
  }

  @ApiOperation({ summary: '스타트업 분기 배당금 즉시 수령 (지갑 입금)' })
  @Post('claim-dividend')
  async claimDividend(
    @Req() req: RequestWithSession,
    @Body() dto: ClaimDividendDto,
  ) {
    const actorUserId = requireUserId(req);
    return {
      success: true,
      claimedAmountWld: 48500,
      investmentId: dto.investmentId,
      transferredToUserId: actorUserId,
      message: '분기 스타트업 배당금 48,500 WLD가 지갑에 안전하게 입금되었습니다.',
    };
  }

  @ApiOperation({ summary: '창업자 스타트업 펀딩 피치 신규 등록 신청' })
  @Post('apply-founder')
  async applyFounderPitch(
    @Req() req: RequestWithSession,
    @Body() dto: ApplyVentureFounderDto,
  ) {
    const actorUserId = requireUserId(req);
    const newPitch: VenturePitch = {
      id: `pitch-${dto.idempotencyKey.slice(0, 8)}`,
      name: dto.startupName,
      sector: dto.sector,
      stage: 'SEED',
      founderName: `Founder_${actorUserId.slice(0, 6)}`,
      targetFundingWld: dto.targetFundingWld,
      currentFundingWld: 0,
      investorCount: 0,
      equitySharePercent: dto.equitySharePercent,
      expectedAnnualYieldPercent: 20.0,
      daysRemaining: 30,
      description: dto.description,
    };

    return {
      success: true,
      pitch: newPitch,
      message: `${dto.startupName} 크라우드펀딩 피치가 성공적으로 등록되어 심사 중입니다.`,
    };
  }
}
