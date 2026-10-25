import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsInt, IsPositive, IsString, IsUUID } from 'class-validator';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';

export class DeclareWarDto {
  @ApiProperty({ description: '공성 대상 요새 ID' })
  @IsString()
  readonly strongholdId!: string;

  @ApiProperty({ description: '도전 클럽 ID' })
  @IsString()
  readonly clubId!: string;

  @ApiProperty({ description: '선전포고 보증금 WLD' })
  @IsInt()
  @IsPositive()
  readonly depositWld!: number;

  @ApiProperty({ format: 'uuid', description: '클라이언트 소유 멱등성 키' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class AttackStrongholdDto {
  @ApiProperty({ description: '공격 전력/투입 WLD 수치' })
  @IsInt()
  @IsPositive()
  readonly attackPowerWld!: number;

  @ApiProperty({ description: '사용할 버프 아이템 ID', required: false })
  @IsString()
  readonly buffItemId?: string;

  @ApiProperty({ format: 'uuid', description: '클라이언트 소유 멱등성 키' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class ClaimStrongholdTaxDto {
  @ApiProperty({ description: '점령 요새 ID' })
  @IsString()
  readonly strongholdId!: string;

  @ApiProperty({ format: 'uuid', description: '클라이언트 소유 멱등성 키' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

const WARFARE_UNAVAILABLE =
  '공성전 점령 기록과 WLD 배당 원장 영수증을 검증할 수 없어 이 기능은 제공되지 않습니다.';

@ApiTags('warfare')
@Controller('clubs/warfare')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
export class WarfareController {
  @ApiOperation({ summary: '검증된 공성전 데이터가 없으면 조회 거부' })
  @Get('strongholds')
  async listStrongholds() {
    // The previous hardcoded owners and daily yields were never database records.
    throw new ServiceUnavailableException(WARFARE_UNAVAILABLE);
  }

  @ApiOperation({ summary: '검증된 클럽 점령·세금 상태가 없으면 조회 거부' })
  @Get('status')
  async getWarfareStatus(@Req() req: RequestWithSession) {
    requireUserId(req);
    throw new ServiceUnavailableException(WARFARE_UNAVAILABLE);
  }

  @ApiOperation({ summary: '공성전 선전포고 — 원장 연동 전 비활성화' })
  @Post('declare')
  async declareWar(@Req() _req: RequestWithSession, @Body() _dto: DeclareWarDto) {
    throw new ServiceUnavailableException(WARFARE_UNAVAILABLE);
  }

  @ApiOperation({ summary: '공성전 공격 — 원장 연동 전 비활성화' })
  @Post(':id/attack')
  async attackStronghold(
    @Req() _req: RequestWithSession,
    @Param('id') _strongholdId: string,
    @Body() _dto: AttackStrongholdDto,
  ) {
    throw new ServiceUnavailableException(WARFARE_UNAVAILABLE);
  }

  @ApiOperation({ summary: '길드 세금 배당 — 원장 연동 전 비활성화' })
  @Post('claim-tax')
  async claimStrongholdTax(@Req() _req: RequestWithSession, @Body() _dto: ClaimStrongholdTaxDto) {
    throw new ServiceUnavailableException(WARFARE_UNAVAILABLE);
  }
}
