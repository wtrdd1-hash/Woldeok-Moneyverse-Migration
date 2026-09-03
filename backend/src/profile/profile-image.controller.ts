import {
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Req,
  Res,
  ServiceUnavailableException,
  Version,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { PrivateImageStorage } from '../content/private-image-storage';
import type { RequestWithSession } from '../auth/session.context';
import { SessionRepository } from '../auth/session.repository';
import { sessionToken } from '../auth/cookies';
import type { AppConfig } from '../core/config';
import { CONFIG } from '../core/config';
import { ProfileRepository } from './profile.repository';

/**
 * The bytes of a member's profile picture.
 *
 * No mandatory session guard because public profiles are visible anonymously,
 * but session token is resolved from request headers when present so members-only
 * profile pictures are visible to signed-in viewers.
 */
@ApiTags('content')
@Controller('media/profile')
export class ProfileImageController {
  constructor(
    @Inject(ProfileRepository) private readonly profiles: ProfileRepository | null,
    @Inject(PrivateImageStorage) private readonly storage: PrivateImageStorage | null,
    @Inject(SessionRepository) private readonly sessions: SessionRepository | null,
    @Inject(CONFIG) private readonly config: AppConfig,
  ) {}

  @Get(':key')
  @Version(VERSION_NEUTRAL)
  @ApiOperation({ summary: 'Bytes of a member’s profile picture, on their terms' })
  async image(
    @Req() request: RequestWithSession,
    @Param('key') key: string,
    @Res() response: Response,
  ): Promise<void> {
    if (!this.profiles || !this.storage) {
      throw new ServiceUnavailableException('profile service is unavailable');
    }

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

    const missing = new NotFoundException('not found');
    if (!(await this.profiles.imageVisible(viewer, key))) throw missing;

    const bytes = await this.storage.read(key);
    if (!bytes) throw missing;

    response.setHeader('content-type', mimeFor(key));
    response.setHeader('x-content-type-options', 'nosniff');
    response.setHeader('content-disposition', 'inline');
    response.setHeader('cache-control', 'private, max-age=300');
    response.end(bytes);
  }
}

function mimeFor(key: string): string {
  if (key.endsWith('.png')) return 'image/png';
  if (key.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}
