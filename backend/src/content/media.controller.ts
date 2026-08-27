import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  ServiceUnavailableException,
  Res,
  Version,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ContentService } from './content.service';
import { PrivateImageStorage } from './private-image-storage';

const MIME_TYPES: Readonly<Record<string, string>> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
};

/**
 * Serves the bytes behind a published gallery photo.
 *
 * Unversioned and outside the `/api` prefix because the stored `imageUrl` of
 * every existing photo row is a `/media/...` path. Moving it would break rows
 * already in the production database, which is not something a rewrite of the
 * web tier gets to do.
 *
 * Two gates, both required. `isPublicStorageKey` asks the database whether
 * that key belongs to a *published* photo, so an operator's unreviewed upload
 * stays unreachable even though its key is a valid one; `PrivateImageStorage`
 * then re-validates the key's shape before it touches the filesystem. Neither
 * is redundant: the first decides visibility, the second decides safety.
 */
@ApiTags('content')
@Controller('media')
export class MediaController {
  constructor(
    @Inject(ContentService) private readonly content: ContentService | null,
    @Inject(PrivateImageStorage) private readonly storage: PrivateImageStorage | null,
  ) {}

  @Get(':key')
  @Version(VERSION_NEUTRAL)
  @ApiOperation({ summary: 'Bytes of a published gallery photo' })
  async media(@Param('key') key: string, @Res() response: Response): Promise<void> {
    // A service that was never wired is a deployment state, not an answer
    // about this key, and every other controller here reports it as 503.
    if (!this.content || !this.storage) {
      throw new ServiceUnavailableException('content service is unavailable');
    }

    // From here one answer covers "no such photo", "not published yet" and
    // "not on disk". Distinguishing them would let a caller confirm that an
    // unreviewed upload exists, which is exactly what publication withholds.
    const missing = new NotFoundException('not found');
    if (!(await this.content.isPublicStorageKey(key))) throw missing;

    const bytes = await this.storage.read(key);
    if (!bytes) throw missing;

    const extension = key.slice(key.lastIndexOf('.') + 1).toLowerCase();
    const mimeType = MIME_TYPES[extension];
    if (!mimeType) throw missing;

    response.setHeader('content-type', mimeType);
    response.setHeader('content-length', bytes.length);
    // The key is a random UUID that never names different bytes, so the
    // response is immutable for as long as the photo stays published.
    response.setHeader('cache-control', 'public, max-age=86400, immutable');
    response.setHeader('x-content-type-options', 'nosniff');
    response.end(bytes);
  }
}
