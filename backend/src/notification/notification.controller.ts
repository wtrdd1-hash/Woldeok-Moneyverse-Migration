import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireSession, requireUserId } from '../auth/session.context';
import { isAuthorizationFailure } from '../core/pg-error';
import { NotificationQueryDto, NotificationSearchDto } from './notification.dto';
import { NotificationService } from './notification.service';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  private async guarded<T>(work: () => Promise<T>): Promise<T> {
    try {
      return await work();
    } catch (error: unknown) {
      if (isAuthorizationFailure(error)) throw new ForbiddenException('this is not yours');
      throw error;
    }
  }

  @Get()
  @Header('Cache-Control', 'private, no-store')
  @Header('X-Robots-Tag', 'noindex')
  @ApiOperation({ summary: 'List owner notifications with read/unread filters and pagination' })
  listNotifications(
    @Req() request: RequestWithSession,
    @Query() query: NotificationQueryDto,
  ) {
    return this.guarded(() =>
      this.notificationService.listNotifications(requireUserId(request), query),
    );
  }

  @Post('search')
  @UseGuards(CsrfGuard)
  @Header('Cache-Control', 'private, no-store')
  @Header('X-Robots-Tag', 'noindex')
  @ApiOperation({ summary: 'Read-only owner-bound notification keyword and date search with signed keyset cursor' })
  searchNotifications(@Req() request: RequestWithSession, @Body() body: NotificationSearchDto) {
    const session = requireSession(request);
    return this.guarded(() => this.notificationService.searchNotifications(requireUserId(request), session.id, body));
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get total unread in-app notification count for current user' })
  unreadCount(@Req() request: RequestWithSession) {
    return this.guarded(async () => {
      const count = await this.notificationService.unreadCount(requireUserId(request));
      return { unreadCount: count };
    });
  }

  @Post(':id/read')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Mark a specific in-app notification as read' })
  markRead(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) notificationId: string,
  ) {
    return this.guarded(() =>
      this.notificationService.markRead(requireUserId(request), notificationId),
    );
  }

  @Post('read-all')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Mark all in-app notifications as read for current user' })
  markAllRead(@Req() request: RequestWithSession) {
    return this.guarded(() =>
      this.notificationService.markAllRead(requireUserId(request)),
    );
  }

  @Post('read-all-receipt')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Mark all owner notifications read and observe remaining unread count' })
  markAllReadWithReceipt(@Req() request: RequestWithSession) {
    return this.guarded(() =>
      this.notificationService.markAllReadWithReceipt(requireUserId(request)),
    );
  }

  @Post('claim-all')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Reward claim unavailable until atomic ledger-backed settlement is implemented' })
  claimAll(@Req() request: RequestWithSession) {
    return this.guarded(() =>
      this.notificationService.claimAll(requireUserId(request)),
    );
  }
}

