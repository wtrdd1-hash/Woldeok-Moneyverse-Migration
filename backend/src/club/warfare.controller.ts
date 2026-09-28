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

export class DeclareWarDto {
  @ApiProperty({ description: '공성 대상 요새 ID', example: 'stronghold-central-bank' })
  @IsString()
  readonly strongholdId!: string;

  @ApiProperty({ description: '도전 클럽 ID', example: 'club-dragon-guild' })
  @IsString()
  readonly clubId!: string;

  @ApiProperty({ description: '선전포고 보증금 WLD (소각/잠금)', example: 1000000 })
  @IsInt()
  @IsPositive()
  readonly depositWld!: number;

  @ApiProperty({ format: 'uuid', description: '클라이언트 소유 멱등성 키' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class AttackStrongholdDto {
  @ApiProperty({ description: '공격 전력/투입 WLD 수치', example: 50000 })
  @IsInt()
  @IsPositive()
  readonly attackPowerWld!: number;

  @ApiProperty({ description: '사용할 버프 아이템 ID', required: false, example: 'buff-war-potion-x2' })
  @IsString()
  readonly buffItemId?: string;

  @ApiProperty({ format: 'uuid', description: '클라이언트 소유 멱등성 키' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class ClaimStrongholdTaxDto {
  @ApiProperty({ description: '점령 요새 ID', example: 'stronghold-central-bank' })
  @IsString()
  readonly strongholdId!: string;

  @ApiProperty({ format: 'uuid', description: '클라이언트 소유 멱등성 키' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export interface Stronghold {
  id: string;
  name: string;
  description: string;
  currentOwnerClubName: string;
  currentOwnerClubId: string;
  defenseScore: number;
  maxDefenseScore: number;
  dailyTaxYieldWld: number;
  occupancyDays: number;
  status: 'PEACE' | 'SIEGE_ACTIVE' | 'COOLDOWN';
}

@ApiTags('warfare')
@Controller('clubs/warfare')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
export class WarfareController {
  private mockStrongholds: Stronghold[] = [
    {
      id: 'stronghold-central-bank',
      name: '월덕 중앙은행 금고 요새',
      description: '월덕 전체 금융 거래 수수료 0.5%를 독점 징수하는 최고 전략 거점',
      currentOwnerClubName: '발할라 파이낸스 길드',
      currentOwnerClubId: 'club-valhalla',
      defenseScore: 840000,
      maxDefenseScore: 1000000,
      dailyTaxYieldWld: 2500000,
      occupancyDays: 14,
      status: 'SIEGE_ACTIVE',
    },
    {
      id: 'stronghold-krx-exchange',
      name: '테헤란 증권거래소 타워',
      description: '가상 주식 및 파생상품 거래량 비례 거래세 징수 거점',
      currentOwnerClubName: '퀀트 마피아',
      currentOwnerClubId: 'club-quant-mafia',
      defenseScore: 920000,
      maxDefenseScore: 1000000,
      dailyTaxYieldWld: 1800000,
      occupancyDays: 28,
      status: 'PEACE',
    },
    {
      id: 'stronghold-pangyo-datacenter',
      name: '판교 퀀트 슈퍼컴 데이터센터',
      description: '서버 연산 버프 및 퀀트 봇 수수료 감면 특권 제공 요새',
      currentOwnerClubName: '네오 테크 길드',
      currentOwnerClubId: 'club-neo-tech',
      defenseScore: 650000,
      maxDefenseScore: 1000000,
      dailyTaxYieldWld: 1200000,
      occupancyDays: 6,
      status: 'PEACE',
    },
  ];

  @ApiOperation({ summary: '공성전 요새 목록 및 실시간 점령 현황 조회' })
  @Get('strongholds')
  async listStrongholds() {
    return {
      strongholds: this.mockStrongholds,
      currentSeason: 4,
      seasonEndsAt: new Date(Date.now() + 86400000 * 7).toISOString(),
    };
  }

  @ApiOperation({ summary: '내 클럽의 공성전 참여 및 점령 상태 조회' })
  @Get('status')
  async getWarfareStatus(@Req() req: RequestWithSession) {
    const actorUserId = requireUserId(req);
    return {
      myClub: {
        id: 'club-valhalla',
        name: '발할라 파이낸스 길드',
        ownedStrongholds: ['stronghold-central-bank'],
        accumulatedTaxPoolWld: 4200000,
        unclaimedTaxWld: 1250000,
        warfareScoreRank: 1,
      },
    };
  }

  @ApiOperation({ summary: '요새 공성전 선전포고 (보증금 결제)' })
  @Post('declare')
  async declareWar(
    @Req() req: RequestWithSession,
    @Body() dto: DeclareWarDto,
  ) {
    const actorUserId = requireUserId(req);
    const stronghold = this.mockStrongholds.find((s) => s.id === dto.strongholdId) ?? this.mockStrongholds[0]!;

    return {
      success: true,
      strongholdId: dto.strongholdId,
      clubId: dto.clubId,
      message: `${stronghold.name}에 대한 선전포고가 선포되었습니다. 2시간 동안 공성전이 활성화됩니다!`,
    };
  }

  @ApiOperation({ summary: '공성전 실시간 타격 및 방어벽 공략 (전투력 투입)' })
  @Post(':id/attack')
  async attackStronghold(
    @Req() req: RequestWithSession,
    @Param('id') strongholdId: string,
    @Body() dto: AttackStrongholdDto,
  ) {
    const actorUserId = requireUserId(req);
    return {
      success: true,
      strongholdId,
      damageDealt: dto.attackPowerWld * 1.5,
      remainingDefenseScore: 765000,
      contributionPointsEarned: Math.round(dto.attackPowerWld / 100),
      message: `성공적으로 ${strongholdId} 방어벽을 타격하여 길드 공헌도를 획득했습니다.`,
    };
  }

  @ApiOperation({ summary: '점령 요새 누적 통행세/거래세 배당금 수령' })
  @Post('claim-tax')
  async claimStrongholdTax(
    @Req() req: RequestWithSession,
    @Body() dto: ClaimStrongholdTaxDto,
  ) {
    const actorUserId = requireUserId(req);
    return {
      success: true,
      claimedTaxWld: 1250000,
      strongholdId: dto.strongholdId,
      transferredToUserId: actorUserId,
      message: '점령 요새 일일 거래세 배당금 1,250,000 WLD가 길드 금고/지갑에 입금되었습니다.',
    };
  }
}
