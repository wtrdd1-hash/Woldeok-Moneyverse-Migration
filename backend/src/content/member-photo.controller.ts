import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Inject,
  Post,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { isAuthorizationFailure, isExpectedCommandFailure } from '../core/pg-error';
import { ImageUploadError } from './image-upload-validation';
import { MemberPhotoInputError, MemberPhotoRepository } from './member-photo.repository';
import { PrivateImageStorage } from './private-image-storage';

export class PhotoSubmissionDto {
  @ApiProperty({ description: 'A key this server issued from POST /photos/uploads' })
  @IsString()
  @MaxLength(64)
  readonly storageKey!: string;

  @ApiProperty({ maxLength: 300 })
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  readonly altText!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

/**
 * A member sending a photo to the gallery.
 *
 * Two calls, mirroring the operator's path exactly: bytes first, then the
 * record that names them. It is not one call because the bytes arrive as a
 * raw body -- `PrivateImageStorage` sniffs the content itself rather than
 * trusting a declared type -- and a caption cannot ride inside an image.
 *
 * Nothing here publishes. 098 writes the row as a draft, which the CHECK on
 * `photos` ties to private and unpublished, and only an operator's
 * `content_set_photo_publication` moves it. The upload is reachable by any
 * member; the gallery is not.
 */
@ApiTags('content')
@Controller('photos')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
export class MemberPhotoController {
  constructor(
    @Inject(MemberPhotoRepository) private readonly photos: MemberPhotoRepository | null,
    @Inject(PrivateImageStorage) private readonly storage: PrivateImageStorage | null,
  ) {}

  private repository(): MemberPhotoRepository {
    if (!this.photos) throw new ServiceUnavailableException('photo submissions are unavailable');
    return this.photos;
  }

  private async guarded<T>(work: () => Promise<T>, conflictMessage: string): Promise<T> {
    try {
      return await work();
    } catch (error: unknown) {
      if (error instanceof MemberPhotoInputError) throw new BadRequestException(error.message);
      if (isAuthorizationFailure(error)) throw new ForbiddenException('this is not yours');
      if (isExpectedCommandFailure(error)) throw new ConflictException(conflictMessage);
      throw error;
    }
  }

  /**
   * The bytes. Answers a storage key and records nothing: a key with no row
   * behind it is a file nobody can reach, which is the safe direction to fail
   * in if the member closes the tab before naming it.
   */
  @Post('uploads')
  @HttpCode(201)
  @ApiOperation({ summary: 'Upload image bytes and receive a storage key' })
  async upload(@Body() body: Buffer) {
    if (!this.storage) throw new ServiceUnavailableException('photo storage is unavailable');
    try {
      return await this.storage.save(body);
    } catch (error: unknown) {
      if (error instanceof ImageUploadError) throw new BadRequestException(error.message);
      throw error;
    }
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Send an uploaded photo to the gallery for review' })
  submit(@Req() request: RequestWithSession, @Body() body: PhotoSubmissionDto) {
    return this.guarded(
      () =>
        this.repository().submit(
          requireUserId(request),
          body.idempotencyKey,
          body.storageKey,
          body.altText,
        ),
      '오늘 보낼 수 있는 사진을 모두 보냈어요.',
    );
  }

  @Get('mine')
  @ApiOperation({ summary: 'The caller’s own submissions and where each one got to' })
  async mine(@Req() request: RequestWithSession) {
    return {
      submissions: await this.guarded(
        () => this.repository().mine(requireUserId(request)),
        'submissions are unavailable',
      ),
    };
  }
}
