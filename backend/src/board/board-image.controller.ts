import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { ImageUploadError } from '../content/image-upload-validation';
import { PrivateImageStorage } from '../content/private-image-storage';
import { BoardService } from './board.service';

@ApiTags('board')
@Controller('board/images')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
export class BoardImageController {
  constructor(
    @Inject(BoardService) private readonly board: BoardService | null,
    @Inject(PrivateImageStorage) private readonly storage: PrivateImageStorage | null,
  ) {}

  @Post('uploads')
  @HttpCode(201)
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Upload one image for a board post' })
  async upload(@Body() body: Buffer) {
    if (!this.storage) throw new ServiceUnavailableException('board image storage is unavailable');
    try {
      return await this.storage.save(body);
    } catch (error: unknown) {
      if (error instanceof ImageUploadError) throw new BadRequestException(error.message);
      throw error;
    }
  }

  @Get(':key')
  @ApiOperation({ summary: 'Read an image attached to a visible board post' })
  async image(
    @Req() request: RequestWithSession,
    @Param('key') key: string,
    @Res() response: Response,
  ): Promise<void> {
    if (!this.board || !this.storage) {
      throw new ServiceUnavailableException('board image service is unavailable');
    }
    if (!(await this.board.imageVisible(requireUserId(request), key))) {
      throw new NotFoundException('not found');
    }
    const bytes = await this.storage.read(key);
    if (!bytes) throw new NotFoundException('not found');
    response.setHeader('content-type', mimeFor(key));
    response.setHeader('content-disposition', 'inline');
    response.setHeader('cache-control', 'private, max-age=300');
    response.setHeader('x-content-type-options', 'nosniff');
    response.end(bytes);
  }
}

function mimeFor(key: string): string {
  if (key.endsWith('.png')) return 'image/png';
  if (key.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}
