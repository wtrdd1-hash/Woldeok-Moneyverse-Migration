import { Controller, Get, Inject, NotFoundException, Param, Res, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { PrivateImageStorage } from '../content/private-image-storage';
import { PublicBoardService } from './public-board.service';

@ApiTags('board')
@Controller('board/public/images')
export class PublicBoardImageController {
  constructor(
    @Inject(PublicBoardService) private readonly board: PublicBoardService | null,
    @Inject(PrivateImageStorage) private readonly storage: PrivateImageStorage | null,
  ) {}

  @Get(':key')
  @ApiOperation({ summary: 'Public image attached to a visible board post' })
  async image(@Param('key') key: string, @Res() response: Response): Promise<void> {
    if (!this.board || !this.storage) {
      throw new ServiceUnavailableException('public board image service is unavailable');
    }
    if (!(await this.board.imageVisible(key))) throw new NotFoundException('not found');
    const bytes = await this.storage.read(key);
    if (!bytes) throw new NotFoundException('not found');
    response.setHeader('content-type', mimeFor(key));
    response.setHeader('content-disposition', 'inline');
    response.setHeader('cache-control', 'public, max-age=300');
    response.setHeader('x-content-type-options', 'nosniff');
    response.end(bytes);
  }
}

function mimeFor(key: string): string {
  if (key.endsWith('.png')) return 'image/png';
  if (key.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}
