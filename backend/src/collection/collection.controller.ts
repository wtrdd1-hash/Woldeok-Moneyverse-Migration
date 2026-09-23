import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { AdvanceCurationDto, UpdateCollectionPieceDto } from './collection.dto';
import { CollectionService } from './collection.service';

@ApiTags('collections')
@Controller('collections')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @ApiOperation({ summary: '내 수집품 조각 목록 조회' })
  @Get()
  async listCollections(@Req() req: RequestWithSession) {
    const userId = requireUserId(req);
    const pieces = await this.collectionService.listCollections(userId);
    return { pieces };
  }

  @ApiOperation({ summary: '수집품 유저 메모 및 즐겨찾기 수정' })
  @Put(':id')
  async updatePiece(
    @Req() req: RequestWithSession,
    @Param('id') pieceId: string,
    @Body() dto: UpdateCollectionPieceDto,
  ) {
    const userId = requireUserId(req);
    const ok = await this.collectionService.updatePiece(
      userId,
      pieceId,
      dto.userNote,
      dto.isFavorite,
    );
    return { ok };
  }

  @ApiOperation({ summary: 'D1~D7 소유권 큐레이션 사다리 상태 조회' })
  @Get('curation/status')
  async getCurationStatus(@Req() req: RequestWithSession) {
    const userId = requireUserId(req);
    const status = await this.collectionService.getCurationStatus(userId);
    return { status };
  }

  @ApiOperation({ summary: '소유권 큐레이션 사다리 단계 진척' })
  @Post('curation/advance')
  async advanceCuration(
    @Req() req: RequestWithSession,
    @Body() dto: AdvanceCurationDto,
  ) {
    const userId = requireUserId(req);
    const status = await this.collectionService.advanceCuration(
      userId,
      dto.targetStep,
      dto.timelineDay,
    );
    return { status };
  }
}
