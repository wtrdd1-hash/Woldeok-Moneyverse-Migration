import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { isExpectedCommandFailure } from '../core/pg-error';
import { ContentInputError } from './content.repository';
import { ContentService } from './content.service';

export class SaveAnnouncementDto {
  @ApiProperty({ required: false, format: 'uuid', description: 'Omit to create' })
  @IsOptional()
  @IsUUID()
  readonly announcementId?: string;

  @ApiProperty({ maxLength: 160 })
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  readonly title!: string;

  @ApiProperty({ maxLength: 12000 })
  @IsString()
  @MinLength(1)
  @MaxLength(12_000)
  readonly body!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class SavePhotoDto {
  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  readonly photoId?: string;

  @ApiProperty({ description: 'Key in the private image store' })
  @IsString()
  @MaxLength(200)
  readonly storageKey!: string;

  @ApiProperty({ description: 'Source URL, validated against the allowed host list' })
  @IsString()
  @MaxLength(2000)
  readonly imageUrl!: string;

  @ApiProperty({ maxLength: 300 })
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  readonly altText!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class SetAnnouncementImageDto {
  @ApiProperty({ description: 'Key in the private image store' })
  @IsString()
  @MaxLength(255)
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

export class PublicationDto {
  @ApiProperty()
  @IsBoolean()
  readonly publish!: boolean;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

/**
 * Announcements, the gallery and the server status board.
 *
 * The reads are public and unguarded: they are what the landing page shows a
 * visitor. Only published rows are returned, and the database functions
 * decide what "published" means — the application never filters drafts out
 * itself, so a mistake here cannot leak one.
 */
@ApiTags('content')
@Controller()
export class ContentController {
  constructor(@Inject(ContentService) private readonly content: ContentService | null) {}

  private service(): ContentService {
    if (!this.content) throw new ServiceUnavailableException('content service is unavailable');
    return this.content;
  }

  private async guarded<T>(work: () => Promise<T>, message: string): Promise<T> {
    try {
      return await work();
    } catch (error: unknown) {
      if (error instanceof ContentInputError) throw new BadRequestException(error.message);
      if (isExpectedCommandFailure(error)) throw new BadRequestException(message);
      throw error;
    }
  }

  @Get('announcements')
  @ApiOperation({ summary: 'Published announcements' })
  async announcements() {
    return { announcements: await this.service().publicAnnouncements() };
  }

  @Get('photos')
  @ApiOperation({ summary: 'Published gallery photos' })
  async photos() {
    return { photos: await this.service().publicPhotos() };
  }

  @Get('status')
  @ApiOperation({ summary: 'Server status board' })
  async status() {
    return { status: await this.service().serviceStatus() };
  }

  @Post('admin/announcements')
  @UseGuards(
    SessionGuard,
    AuthenticatedGuard,
    ConsentGuard,
    AdminGuard,
    AdminSessionGuard,
    CsrfGuard,
  )
  @ApiOperation({ summary: 'Create or edit an announcement' })
  saveAnnouncement(@Req() request: RequestWithSession, @Body() body: SaveAnnouncementDto) {
    return this.guarded(
      () => this.service().saveAnnouncement(requireUserId(request), { ...body }),
      'invalid announcement',
    );
  }

  @Put('admin/announcements/:id/image')
  @UseGuards(
    SessionGuard,
    AuthenticatedGuard,
    ConsentGuard,
    AdminGuard,
    AdminSessionGuard,
    CsrfGuard,
  )
  @ApiOperation({ summary: 'Attach an uploaded image to a draft announcement' })
  setAnnouncementImage(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) announcementId: string,
    @Body() body: SetAnnouncementImageDto,
  ) {
    return this.guarded(
      () =>
        this.service().setAnnouncementImage(requireUserId(request), { announcementId, ...body }),
      'invalid announcement image',
    );
  }

  @Put('admin/announcements/:id/publication')
  @UseGuards(
    SessionGuard,
    AuthenticatedGuard,
    ConsentGuard,
    AdminGuard,
    AdminSessionGuard,
    CsrfGuard,
  )
  @ApiOperation({ summary: 'Publish or unpublish an announcement' })
  publishAnnouncement(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) announcementId: string,
    @Body() body: PublicationDto,
  ) {
    return this.guarded(
      () =>
        this.service().setAnnouncementPublication(requireUserId(request), {
          announcementId,
          ...body,
        }),
      'invalid publication change',
    );
  }

  @Post('admin/photos/metadata')
  @UseGuards(
    SessionGuard,
    AuthenticatedGuard,
    ConsentGuard,
    AdminGuard,
    AdminSessionGuard,
    CsrfGuard,
  )
  @ApiOperation({ summary: 'Create or edit a photo record' })
  savePhoto(@Req() request: RequestWithSession, @Body() body: SavePhotoDto) {
    return this.guarded(
      () => this.service().savePhoto(requireUserId(request), { ...body }),
      'invalid photo',
    );
  }

  @Put('admin/photos/:id/publication')
  @UseGuards(
    SessionGuard,
    AuthenticatedGuard,
    ConsentGuard,
    AdminGuard,
    AdminSessionGuard,
    CsrfGuard,
  )
  @ApiOperation({ summary: 'Publish or unpublish a photo' })
  publishPhoto(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) photoId: string,
    @Body() body: PublicationDto,
  ) {
    return this.guarded(
      () => this.service().setPhotoPublication(requireUserId(request), { photoId, ...body }),
      'invalid publication change',
    );
  }


  @Get('admin/announcements')
  @UseGuards(
    SessionGuard,
    AuthenticatedGuard,
    ConsentGuard,
    AdminGuard,
    AdminSessionGuard,
  )
  @ApiOperation({ summary: 'List all announcements for administrators' })
  adminAnnouncements(@Req() request: RequestWithSession) {
    return this.guarded(
      () => this.service().adminListAllAnnouncements(requireUserId(request)),
      'could not list announcements',
    );
  }

  @Delete('admin/announcements/:id')
  @UseGuards(
    SessionGuard,
    AuthenticatedGuard,
    ConsentGuard,
    AdminGuard,
    AdminSessionGuard,
    CsrfGuard,
  )
  @ApiOperation({ summary: 'Delete an announcement' })
  deleteAnnouncement(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) announcementId: string,
  ) {
    return this.guarded(
      () => this.service().adminDeleteAnnouncement(requireUserId(request), announcementId),
      'could not delete announcement',
    );
  }

  @Get('admin/photos/submissions')
  @UseGuards(
    SessionGuard,
    AuthenticatedGuard,
    ConsentGuard,
    AdminGuard,
    AdminSessionGuard,
  )
  @ApiOperation({ summary: 'List pending photo submissions awaiting review' })
  listPendingPhotos(@Req() request: RequestWithSession) {
    return this.guarded(
      () => this.service().listPendingPhotos(requireUserId(request)),
      'could not list pending photos',
    );
  }

  @Delete('admin/photos/:id')
  @UseGuards(
    SessionGuard,
    AuthenticatedGuard,
    ConsentGuard,
    AdminGuard,
    AdminSessionGuard,
    CsrfGuard,
  )
  @ApiOperation({ summary: 'Reject and delete a draft photo submission' })
  rejectPhoto(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) photoId: string,
    @Body('reason') reason?: string,
  ) {
    return this.guarded(
      () => this.service().rejectPhoto(requireUserId(request), photoId, reason),
      'could not reject photo',
    );
  }
}
