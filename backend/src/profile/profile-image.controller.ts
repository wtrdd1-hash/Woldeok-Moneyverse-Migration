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
import { ProfileRepository } from './profile.repository';

/**
 * The bytes of a member's profile picture.
 *
 * A second serving route rather than a branch inside `MediaController`,
 * because the two answer different questions and share only a directory.
 * `/media/:key` asks whether an operator published a gallery photo; this asks
 * whether the member whose picture it is chose to show it to this reader.
 * Folding them together would mean one route holding both gates and getting
 * the wrong one right.
 *
 * No session guard. A profile may be 'public', which means readable by
 * somebody who is not signed in, and 094 decides that from the profile's own
 * visibility -- so the route forwards whoever the caller is, including
 * nobody, and lets the database answer. Adding a guard here would make a
 * public profile's picture members-only and contradict the setting beside it.
 */
@ApiTags('content')
@Controller('media/profile')
export class ProfileImageController {
  constructor(
    @Inject(ProfileRepository) private readonly profiles: ProfileRepository | null,
    @Inject(PrivateImageStorage) private readonly storage: PrivateImageStorage | null,
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

    // One answer covers "no such key", "not a profile image", "the owner is
    // gone" and "not yours to see". Telling them apart would confirm that a
    // member has a picture they chose not to show, which is the thing the
    // setting exists to withhold.
    const missing = new NotFoundException('not found');
    const viewer = request.session?.user_id ?? null;
    if (!(await this.profiles.imageVisible(viewer, key))) throw missing;

    const bytes = await this.storage.read(key);
    if (!bytes) throw missing;

    // `nosniff` and an explicit type, like the gallery: these bytes were
    // checked against their magic numbers on the way in, and the browser must
    // not be invited to reconsider.
    response.setHeader('content-type', mimeFor(key));
    response.setHeader('x-content-type-options', 'nosniff');
    response.setHeader('content-disposition', 'inline');
    // Private, because the same URL answers differently depending on who
    // asks. A shared cache holding one reader's copy would serve it to a
    // reader the member did not choose.
    response.setHeader('cache-control', 'private, max-age=300');
    response.end(bytes);
  }
}

function mimeFor(key: string): string {
  if (key.endsWith('.png')) return 'image/png';
  if (key.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}
