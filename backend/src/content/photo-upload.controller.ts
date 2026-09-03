import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  Inject,
  Post,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { ImageUploadError } from './image-upload-validation';
import { PrivateImageStorage } from './private-image-storage';

/**
 * Accepts image bytes into the private store and returns the storage key that
 * `POST /admin/photos/metadata` then records.
 *
 * Two things are load-bearing. The role required is `operator` specifically,
 * not merely any administrator role — AdminGuard proves the caller holds some
 * role, and this checks which. And the body is raw bytes: PrivateImageStorage
 * sniffs the content itself rather than trusting a declared type, so nothing
 * here parses or re-encodes it first.
 */
@ApiTags('admin')
@Controller('admin/photos')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard, CsrfGuard)
export class PhotoUploadController {
  constructor(@Inject(PrivateImageStorage) private readonly storage: PrivateImageStorage | null) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Upload image bytes to the private store' })
  async upload(@Req() request: RequestWithSession, @Body() body: Buffer) {
    if (!this.storage) {
      throw new ServiceUnavailableException('administrator service is unavailable');
    }
    if (!(request.adminRoles ?? []).includes('operator')) {
      throw new ForbiddenException('content operator role required');
    }
    try {
      return await this.storage.save(body);
    } catch (error: unknown) {
      if (error instanceof ImageUploadError) throw new BadRequestException(error.message);
      throw error;
    }
  }
}
