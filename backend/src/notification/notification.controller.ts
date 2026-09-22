import {
  Controller,
  ForbiddenException,
  Get,
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
import { requireUserId } from '../auth/session.context';
import { isAuthorizationFailure } from '../core/pg-error';
import { NotificationQueryDto } from './notification.dto';
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
  @ApiOperation({ summary: 'List in-app notifications for current user with unread filter and pagination' })
  listNotifications(
    @Req() request: RequestWithSession,
    @Query() query: NotificationQueryDto,
  ) {
    return this.guarded(() =>
      this.notificationService.listNotifications(requireUserId(request), query),
    );
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
}
