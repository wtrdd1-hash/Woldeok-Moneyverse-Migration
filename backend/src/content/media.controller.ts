import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Req,
  ServiceUnavailableException,
  Res,
  Version,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import type { RequestWithSession } from '../auth/session.context';
import { SessionRepository } from '../auth/session.repository';
import { sessionToken } from '../auth/cookies';
import type { AppConfig } from '../core/config';
import { CONFIG } from '../core/config';
import { ContentService } from './content.service';
import { MemberPhotoRepository } from './member-photo.repository';
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
 *
 * Since 098 there is one exception, and it is asked second so the common case
 * costs one query: a member may read back a photo they submitted themselves,
 * because otherwise they could send one in and never see which file they had
 * sent. That answer depends on who is asking, so it is never cached publicly
 * -- a shared cache holding one member's draft would hand it to a reader the
 * operator has not approved it for.
 */
@ApiTags('content')
@Controller('media')
export class MediaController {
  constructor(
    @Inject(ContentService) private readonly content: ContentService | null,
    @Inject(PrivateImageStorage) private readonly storage: PrivateImageStorage | null,
    @Inject(MemberPhotoRepository) private readonly submissions: MemberPhotoRepository | null,
    @Inject(SessionRepository) private readonly sessions: SessionRepository | null,
    @Inject(CONFIG) private readonly config: AppConfig,
  ) {}

  @Get(':key')
  @Version(VERSION_NEUTRAL)
  @ApiOperation({ summary: 'Bytes of a published gallery photo' })
  async media(
    @Req() request: RequestWithSession,
    @Param('key') key: string,
    @Res() response: Response,
  ): Promise<void> {
    // A service that was never wired is a deployment state, not an answer
    // about this key, and every other controller here reports it as 503.
    if (!this.content || !this.storage) {
      throw new ServiceUnavailableException('content service is unavailable');
    }

    // From here one answer covers "no such photo", "not published yet" and
    // "not on disk". Distinguishing them would let a caller confirm that an
    // unreviewed upload exists, which is exactly what publication withholds.
    const missing = new NotFoundException('not found');
    const published = await this.content.isPublicStorageKey(key);
    if (!published) {
      let viewer: string | null = request.session?.user_id ?? null;
      if (!viewer && this.sessions) {
        const token = sessionToken(request.headers, this.config);
        if (token) {
          const session = await this.sessions.get(token);
          if (session) {
            viewer = session.user_id;
            request.session = session;
          }
        }
      }
      const own = this.submissions
        ? await this.submissions.visibleTo(viewer, key)
        : false;
      if (!own) throw missing;
    }

    const bytes = await this.storage.read(key);
    if (!bytes) throw missing;

    const extension = key.slice(key.lastIndexOf('.') + 1).toLowerCase();
    const mimeType = MIME_TYPES[extension];
    if (!mimeType) throw missing;

    response.setHeader('content-type', mimeType);
    response.setHeader('content-length', bytes.length);
    // The key is a random UUID that never names different bytes, so a
    // published photo is immutable for as long as it stays published. A draft
    // is not: the same URL answers 404 to everybody but its owner, so it must
    // never enter a shared cache.
    response.setHeader(
      'cache-control',
      published ? 'public, max-age=86400, immutable' : 'private, no-store',
    );
    response.setHeader('x-content-type-options', 'nosniff');
    response.end(bytes);
  }
}
