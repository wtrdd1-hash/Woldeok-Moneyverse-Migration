import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminChannelOtpService } from '../auth/admin-channel-otp.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireSession, requireUserId } from '../auth/session.context';

/** No public verification endpoint: only the actual financial mutation consumes a bound OTP. */
@ApiTags('admin-channel-otp')
@Controller('admin/auth/channel-otp')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard)
export class AdminChannelOtpController {
  constructor(private readonly channelOtp: AdminChannelOtpService) {}

  @Post('request')
  @UseGuards(AdminSessionGuard, CsrfGuard)
  @ApiOperation({ summary: 'Issue scoped Discord and Telegram OTP for a Treasury action' })
  async requestOtp(@Req() request: RequestWithSession, @Body() intent: unknown) {
    if (!request.adminRoles?.includes('superadmin')) {
      throw new ForbiddenException('superadministrator required');
    }
    return this.channelOtp.requestOtp(
      requireUserId(request),
      requireSession(request).id,
      intent,
    );
  }
}
