import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SafetyService } from './safety.service';
import {
  EmergencyTakedownSubmitSchema,
  EmergencyTakedownStatusQuerySchema,
  AdminTakedownActionSchema,
} from './safety.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';

@ApiTags('safety')
@Controller()
export class SafetyController {
  constructor(private readonly safetyService: SafetyService) {}

  /**
   * 비회원 공개 긴급 콘텐츠 삭제 접수 (TAKE IT DOWN Act)
   */
  @Post('api/v1/safety/takedown')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '비회원 공개 긴급 콘텐츠 삭제 접수' })
  async submitEmergencyTakedown(@Body() rawBody: unknown) {
    const parsed = EmergencyTakedownSubmitSchema.safeParse(rawBody);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors.map((e) => e.message).join(', '));
    }
    return this.safetyService.submitTakedown(parsed.data);
  }

  /**
   * 비회원 공개 긴급 콘텐츠 삭제 접수 상태 조회
   */
  @Post('api/v1/safety/takedown/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '비회원 접수 상태 조회' })
  async getTakedownStatus(@Body() rawBody: unknown) {
    const parsed = EmergencyTakedownStatusQuerySchema.safeParse(rawBody);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors.map((e) => e.message).join(', '));
    }
    return this.safetyService.getTakedownStatus(parsed.data);
  }

  /**
   * 관리자 긴급 삭제 모더레이션 큐 목록 조회
   */
  @Get('api/v1/admin/safety/takedowns')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard)
  @ApiOperation({ summary: '관리자 긴급 콘텐츠 삭제 큐 조회' })
  async adminListTakedowns(
    @Req() req: RequestWithSession,
    @Query('status') status?: string,
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
  ) {
    const actorUserId = requireUserId(req);
    const limitNum = Math.min(Math.max(1, parseInt(limit, 10) || 50), 100);
    const offsetNum = Math.max(0, parseInt(offset, 10) || 0);
    return this.safetyService.adminListTakedowns(actorUserId, status, limitNum, offsetNum);
  }

  /**
   * 관리자 긴급 삭제 조치 (승인/반려/삭제) 실행
   */
  @Post('api/v1/admin/safety/takedowns/:caseId/action')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard, AdminSessionGuard, CsrfGuard)
  @ApiOperation({ summary: '관리자 긴급 콘텐츠 삭제 조치' })
  async adminActionTakedown(
    @Req() req: RequestWithSession,
    @Param('caseId') caseId: string,
    @Body() rawBody: unknown,
  ) {
    const actorUserId = requireUserId(req);
    const parsed = AdminTakedownActionSchema.safeParse(rawBody);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.errors.map((e) => e.message).join(', '));
    }
    return this.safetyService.adminActionTakedown(actorUserId, caseId, parsed.data);
  }
}
