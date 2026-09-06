import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { sessionToken } from '../auth/cookies';
import { SessionRepository } from '../auth/session.repository';
import { requestClientKey } from '../security/rate-limit';
import type { RequestWithSession } from '../auth/session.context';
import { CONFIG, type AppConfig } from '../core/config';
import { IngestActivityEventsDto, QueryActivityLogsDto } from './activity.dto';
import { ActivityService } from './activity.service';

@ApiTags('activity')
@Controller()
export class ActivityController {
  constructor(
    private readonly activityService: ActivityService,
    @Inject(CONFIG) private readonly config: AppConfig,
    @Inject(SessionRepository) private readonly sessions: SessionRepository | null,
  ) {}

  private extractIp(request: RequestWithSession): string | null {
    const key = requestClientKey(request, {
      trustForwardedFor: this.config.trustProxyForwardedFor,
    });
    return key === 'unknown' ? null : key;
  }

  @Post('activity/events')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ingest client activity telemetry events (page view, dwell, clicks)' })
  async ingestEvents(@Req() request: RequestWithSession, @Body() body: IngestActivityEventsDto) {
    let actor: string | null = null;
    if (this.sessions) {
      const token = sessionToken(request.headers, this.config);
      if (token) {
        try {
          const session = await this.sessions.get(token);
          if (session?.user_id) {
            actor = session.user_id;
          }
        } catch {
          // Proceed as anonymous if session lookup fails
        }
      }
    }
    const ip = this.extractIp(request);
    const userAgent = String(request.headers['user-agent'] ?? '').slice(0, 500);

    const countryHeader = String(
      request.headers['cf-ipcountry'] ?? request.headers['x-vercel-ip-country'] ?? '',
    ).toUpperCase();
    const country = /^[A-Z]{2}$/.test(countryHeader) ? countryHeader : null;
    return this.activityService.recordEvents(body.events, actor, ip, userAgent, country);
  }

  @Get('admin/activity/logs')
  @UseGuards(AdminSessionGuard, AdminGuard)
  @ApiOperation({ summary: 'List user activity logs for administrators' })
  async listLogs(@Query() query: QueryActivityLogsDto) {
    return this.activityService.getLogs(query.limit, query.offset, query.eventType, query.userId);
  }
}
