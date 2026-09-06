import { Injectable, Logger } from '@nestjs/common';
import type { ActivityEventItemDto } from './activity.dto';
import type { ActivityLogRow } from './activity.repository';
import { ActivityRepository } from './activity.repository';

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(private readonly repository: ActivityRepository) {}

  async recordEvents(
    events: ActivityEventItemDto[],
    actor: string | null,
    ip: string | null,
    userAgent: string | null,
    country: string | null,
  ): Promise<{ recorded: number }> {
    try {
      const count = await this.repository.logEvents(events, actor, ip, userAgent, country);
      return { recorded: count };
    } catch (error) {
      this.logger.error('Failed to log activity events', error);
      return { recorded: 0 };
    }
  }

  async getLogs(
    limit: number,
    offset: number,
    eventType?: string,
    userId?: string,
  ): Promise<ActivityLogRow[]> {
    return this.repository.listLogs(limit, offset, eventType, userId);
  }

  async recordRequest(input: Parameters<ActivityRepository['logRequest']>[0]): Promise<void> {
    await this.repository.logRequest(input);
  }
}
