import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { PvpArenaInputError, PvpArenaRepository } from './pvp-arena.repository';

export interface CreatePvpRoomDto {
  readonly gameType: 'dice' | 'rps' | 'hilo';
  readonly stakeAmount: number;
  readonly creatorMove?: string;
}

export interface JoinPvpRoomDto {
  readonly opponentMove?: string;
}

@ApiTags('arena')
@Controller('arena')
export class PvpArenaController {
  constructor(
    @Inject(PvpArenaRepository) private readonly repository: PvpArenaRepository | null,
  ) {}

  @Get('rooms')
  @ApiOperation({ summary: '1:1 대기 중인 승부존 대결방 및 최근 전적 목록 조회' })
  async getRooms() {
    if (!this.repository) {
      throw new BadRequestException('PVP 승부존 시스템이 현재 점검 중입니다.');
    }
    const [waitingRooms, recentBattles] = await Promise.all([
      this.repository.listWaitingRooms(30),
      this.repository.listRecentBattles(15),
    ]);
    return {
      success: true,
      waitingRooms,
      recentBattles,
    };
  }

  @Post('rooms')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
  @ApiOperation({ summary: '1:1 승부존 신규 대결방 생성' })
  async createRoom(@Req() req: RequestWithSession, @Body() body: CreatePvpRoomDto) {
    if (!this.repository) {
      throw new BadRequestException('PVP 승부존 시스템이 현재 점검 중입니다.');
    }
    const userId = requireUserId(req);
    try {
      const room = await this.repository.createRoom({
        creatorUserId: userId,
        gameType: body.gameType,
        stakeAmount: body.stakeAmount,
        creatorMove: body.creatorMove,
      });
      return {
        success: true,
        room,
      };
    } catch (err: any) {
      if (err instanceof PvpArenaInputError) {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }

  @Post('rooms/:roomId/join')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
  @ApiOperation({ summary: '1:1 대결방 참가 및 즉시 대결 실행' })
  async joinRoom(
    @Req() req: RequestWithSession,
    @Param('roomId') roomId: string,
    @Body() body: JoinPvpRoomDto,
  ) {
    if (!this.repository) {
      throw new BadRequestException('PVP 승부존 시스템이 현재 점검 중입니다.');
    }
    const userId = requireUserId(req);
    try {
      const outcome = await this.repository.joinAndPlay({
        roomId,
        opponentUserId: userId,
        opponentMove: body.opponentMove,
      });
      return {
        success: true,
        outcome,
      };
    } catch (err: any) {
      if (err instanceof PvpArenaInputError) {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }

  @Post('rooms/:roomId/cancel')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
  @ApiOperation({ summary: '1:1 대결방 취소' })
  async cancelRoom(@Req() req: RequestWithSession, @Param('roomId') roomId: string) {
    if (!this.repository) {
      throw new BadRequestException('PVP 승부존 시스템이 현재 점검 중입니다.');
    }
    const userId = requireUserId(req);
    try {
      const cancelled = await this.repository.cancelRoom(roomId, userId);
      return {
        success: cancelled,
      };
    } catch (err: any) {
      if (err instanceof PvpArenaInputError) {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }
}
