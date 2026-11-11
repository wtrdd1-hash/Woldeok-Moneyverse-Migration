import {
  Controller,
  Get,
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
  @ApiOperation({ summary: '관리자 텔레그램/디스코드 2FA 일회용 OTP 검증 (R3 단일 소모)' })
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

  @Post('elevate')
  @ApiOperation({ summary: '관리자 텔레그램/디스코드 2FA OTP 검증 후 R2 15분 세션 승격' })
  async elevate(
    @Req() req: RequestWithSession,
    @Body() body: { otpCode: string },
  ) {
    const actorId = requireUserId(req);
    if (!body?.otpCode) {
      throw new BadRequestException('otpCode is required');
    }
    const result = this.otpService.elevateR2Session(actorId, body.otpCode);
    if (!result.success) {
      throw new UnauthorizedException('OTP 코드가 일치하지 않거나 만료되었습니다.');
    }
    return { ok: true, elevated: true, expiresAt: result.expiresAt };
  }

  @Get('status')
  @ApiOperation({ summary: '현재 관리자 R2 세션 승격 상태 및 잔여 시간 조회' })
  async status(@Req() req: RequestWithSession) {
    const actorId = requireUserId(req);
    const status = this.otpService.getR2ElevationStatus(actorId);
    return { ok: true, ...status };
  }

  @Post('revoke')
  @ApiOperation({ summary: '관리자 R2 세션 승격 즉시 잠금(Lockout)' })
  async revoke(@Req() req: RequestWithSession) {
    const actorId = requireUserId(req);
    const result = this.otpService.revokeR2Session(actorId);
    return { ok: true, revoked: true, ...result };
  }

  @Post('test-ping')
  @ApiOperation({ summary: '관리자 텔레그램/디스코드 채널 연동 실시간 테스트 핑 발송' })
  async testPing(
    @Req() req: RequestWithSession,
    @Body() body: { channel?: 'all' | 'telegram' | 'discord' },
  ) {
    const actorId = requireUserId(req);
    const result = await this.otpService.sendTestPing(actorId, body?.channel || 'all');
    return { ok: true, ...result };
  }
}
