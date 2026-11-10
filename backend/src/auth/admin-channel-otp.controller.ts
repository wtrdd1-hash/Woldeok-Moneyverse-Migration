import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SessionGuard } from './guards/session.guard';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { ConsentGuard } from './guards/consent.guard';
import { AdminGuard } from './guards/admin.guard';
import { AdminSessionGuard } from './guards/admin-session.guard';
import { CsrfGuard } from './guards/csrf.guard';
import { requireUserId, RequestWithSession } from './session.context';
import { AdminChannelOtpService } from './admin-channel-otp.service';

@ApiTags('Admin Channel OTP')
@Controller('admin/auth/channel-otp')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard, CsrfGuard)
export class AdminChannelOtpController {
  constructor(private readonly otpService: AdminChannelOtpService) {}

  @Post('request')
  @ApiOperation({ summary: '관리자 텔레그램/디스코드 2FA 일회용 OTP 발송' })
  async requestOtp(
    @Req() req: RequestWithSession,
    @Body() body: { actionName?: string },
  ) {
    const actorId = requireUserId(req);
    const actionName = body?.actionName || '관리자 권한 승인';
    const result = await this.otpService.requestOtp(actorId, actionName);
    return { ok: true, ...result };
  }

  @Post('verify')
  @ApiOperation({ summary: '관리자 텔레그램/디스코드 2FA 일회용 OTP 검증 (단일 소모)' })
  async verifyOtp(
    @Req() req: RequestWithSession,
    @Body() body: { otpCode: string },
  ) {
    const actorId = requireUserId(req);
    if (!body?.otpCode) {
      throw new BadRequestException('otpCode is required');
    }
    const verified = this.otpService.verifyOtp(actorId, body.otpCode);
    if (!verified) {
      throw new UnauthorizedException('OTP 코드가 일치하지 않거나 만료되었습니다.');
    }
    return { ok: true, verified: true };
  }
}
