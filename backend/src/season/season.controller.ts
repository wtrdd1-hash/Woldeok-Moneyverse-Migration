import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiPropertyOptional, ApiTags } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, IsUUID } from 'class-validator';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { isExpectedCommandFailure } from '../core/pg-error';
import { SeasonInputError } from './season.repository';
import { SeasonService } from './season.service';

export class ConsumeDto {
  @ApiProperty({ type: Number, minimum: 1 })
  @IsInt()
  @IsPositive()
  readonly quantity!: number;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class SettleSeasonDto {
  @ApiPropertyOptional({ format: 'uuid', description: '정산 대상 시즌 ID (생략 시 현재 활성 시즌)' })
  @IsOptional()
  @IsUUID()
  readonly seasonId?: string;
}

export class ClaimSeasonRewardDto {
  @ApiProperty({ format: 'uuid', description: '시즌 ID' })
  @IsUUID()
  readonly seasonId!: string;

  @ApiProperty({ format: 'uuid', description: '클라이언트 멱등성 키' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

@ApiTags('seasons')
@Controller('seasons')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
export class SeasonController {
  constructor(@Inject(SeasonService) private readonly seasons: SeasonService | null) {}

  private service(): SeasonService {
    if (!this.seasons) throw new ServiceUnavailableException('season service is unavailable');
    return this.seasons;
  }

  @Get('events')
  @ApiOperation({ summary: 'Active season events' })
  async events() {
    return { events: await this.service().events() };
  }

  @Get('events/:id/leaderboard')
  @ApiOperation({ summary: 'Leaderboard for one event' })
  async leaderboard(@Param('id', ParseUUIDPipe) eventId: string) {
    return { entries: await this.service().leaderboard(eventId) };
  }

  @Post('events/:id/consumptions')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Spend on a season event' })
  async consume(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) eventId: string,
    @Body() body: ConsumeDto,
  ) {
    try {
      return await this.service().consume(requireUserId(request), {
        eventId,
        quantity: body.quantity,
        idempotencyKey: body.idempotencyKey,
      });
    } catch (error: unknown) {
      if (error instanceof SeasonInputError) throw new BadRequestException(error.message);
      if (isExpectedCommandFailure(error)) {
        throw new ConflictException('this season action cannot be completed now');
      }
      throw error;
    }
  }

  @Get('current')
  @ApiOperation({ summary: '현재 시즌 정보 및 내 티어/랭킹 조회' })
  async current(@Req() request: RequestWithSession) {
    const userId = requireUserId(request);
    return { currentSeason: await this.service().current(userId) };
  }

  @Get('hall-of-fame')
  @ApiOperation({ summary: '역대 시즌 명예의 전당 헌액자 목록' })
  async hallOfFame() {
    return { hallOfFame: await this.service().hallOfFame() };
  }

  @Post('settle')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: '시즌 종료 정산 엔진 (명예의 전당 및 6대 티어 보상 분배)' })
  async settle(@Body() body: SettleSeasonDto) {
    try {
      return await this.service().settle(body.seasonId);
    } catch (error: unknown) {
      if (error instanceof SeasonInputError) throw new BadRequestException(error.message);
      if (isExpectedCommandFailure(error)) {
        throw new ConflictException('cannot settle season now');
      }
      throw error;
    }
  }

  @Post('claim-rewards')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: '시즌 보상 청구 및 수령' })
  async claimReward(
    @Req() request: RequestWithSession,
    @Body() body: ClaimSeasonRewardDto,
  ) {
    try {
      const userId = requireUserId(request);
      return await this.service().claimReward(userId, body.seasonId, body.idempotencyKey);
    } catch (error: unknown) {
      if (error instanceof SeasonInputError) throw new BadRequestException(error.message);
      if (isExpectedCommandFailure(error)) {
        throw new ConflictException('cannot claim season reward now');
      }
      throw error;
    }
  }
}
