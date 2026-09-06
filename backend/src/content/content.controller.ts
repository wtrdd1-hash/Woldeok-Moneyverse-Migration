import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Optional,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { DiscordAlertService } from '../discord/discord-alert.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { isExpectedCommandFailure } from '../core/pg-error';
import { contextOf } from '../core/request-context';
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

export class UpdateAnnouncementDto {
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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  readonly isPinned?: boolean;

  @ApiProperty({ required: false, enum: ['draft', 'published'] })
  @IsOptional()
  @IsString()
  readonly contentState?: 'draft' | 'published';
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
  constructor(
    @Inject(ContentService) private readonly content: ContentService | null,
    @Optional() @Inject(DiscordAlertService) private readonly discordAlert?: DiscordAlertService,
  ) {}

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
  async saveAnnouncement(@Req() request: RequestWithSession, @Body() body: SaveAnnouncementDto) {
    const res = await this.guarded(
      () => this.service().saveAnnouncement(requireUserId(request), { ...body }),
      'invalid announcement',
    );
    this.discordAlert
      ?.notifyAnnouncementEvent({
        action: 'created',
        announcementId: res.announcementId,
        title: body.title,
        actorUserId: requireUserId(request),
      })
      .catch(() => {});
    return res;
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

  @Post('admin/photos/:id/approval')
  @UseGuards(
    SessionGuard,
    AuthenticatedGuard,
    ConsentGuard,
    AdminGuard,
    AdminSessionGuard,
    CsrfGuard,
  )
  @ApiOperation({ summary: 'Approve and publish a pending member photo' })
  approveMemberPhoto(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) photoId: string,
  ) {
    return this.guarded(
      () =>
        this.service().setPhotoPublication(requireUserId(request), {
          photoId,
          publish: true,
          idempotencyKey: randomUUID(),
          requestId: contextOf(request)?.requestId ?? null,
        }),
      'invalid photo approval',
    );
  }

  @Get('admin/announcements')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard)
  @ApiOperation({ summary: 'List all announcements for administrators' })
  adminAnnouncements(@Req() request: RequestWithSession) {
    return this.guarded(
      () => this.service().adminListAllAnnouncements(requireUserId(request)),
      'could not list announcements',
    );
  }

  @Put('admin/announcements/:id')
  @UseGuards(
    SessionGuard,
    AuthenticatedGuard,
    ConsentGuard,
    AdminGuard,
    AdminSessionGuard,
    CsrfGuard,
  )
  @ApiOperation({ summary: 'Update an announcement' })
  async updateAnnouncement(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) announcementId: string,
    @Body() body: UpdateAnnouncementDto,
  ) {
    const res = await this.guarded(
      () =>
        this.service().adminUpdateAnnouncement(requireUserId(request), announcementId, {
          ...body,
        }),
      'could not update announcement',
    );
    this.discordAlert
      ?.notifyAnnouncementEvent({
        action: body.isPinned ? 'pinned' : 'updated',
        announcementId: res.announcementId,
        title: res.title,
        actorUserId: requireUserId(request),
      })
      .catch(() => {});
    return res;
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
  async deleteAnnouncement(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) announcementId: string,
  ) {
    const res = await this.guarded(
      () => this.service().adminDeleteAnnouncement(requireUserId(request), announcementId),
      'could not delete announcement',
    );
    this.discordAlert
      ?.notifyAnnouncementEvent({
        action: 'deleted',
        announcementId,
        title: '공지사항 ID ' + announcementId,
        actorUserId: requireUserId(request),
      })
      .catch(() => {});
    return res;
  }

  @Get('admin/photos/submissions')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard)
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
