import {
  Controller,
  Get,
  NotFoundException,
  Post,
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

/**
 * P0 containment for issue #1037. Chat/support uploads share an unowned
 * filesystem object store; an opaque key is not an authorization decision.
 *
 * Until a durable owner/recipient ACL and a migration plan for existing
 * links are available, neither new attachments nor legacy media may be
 * served. The text-only chat and support flows remain available.
 *
 * Do not restore the old FileInterceptor, scanner/storage write, or media
 * read in this controller without the full owner-scoped DB contract.
 */
@ApiTags('chat-upload')
@Controller('content/chat')
export class ChatUploadController {
  @Post('upload')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
  @ApiOperation({ summary: 'Chat image attachments temporarily unavailable pending owner authorization' })
  async uploadChatImage(): Promise<never> {
    // No FileInterceptor: refuse before buffering, scanning or persisting bytes.
    throw new ServiceUnavailableException(
      'Image attachments are temporarily unavailable while private media access controls are upgraded.',
    );
  }

  @Get('media/:key')
  @ApiOperation({ summary: 'Legacy chat media temporarily unavailable pending owner authorization' })
  async getChatMedia(@Res() res: Response): Promise<never> {
    // Even a valid, previously uploaded key must not bypass an owner check.
    // Do not read storage or distinguish existing keys from nonexistent ones.
    res.setHeader('cache-control', 'private, no-store');
    res.setHeader('x-content-type-options', 'nosniff');
    throw new NotFoundException('not found');
  }
}
