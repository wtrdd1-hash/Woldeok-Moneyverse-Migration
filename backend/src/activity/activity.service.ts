import { Injectable, Logger } from '@nestjs/common';
import type { ActivityEventItemDto } from './activity.dto';
import type { ActivityLogRow, TrafficAnalyticsDashboard } from './activity.repository';
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
      throw error;
    }
  }

  async getLogs(
    actor: string,
    limit: number,
    offset: number,
    eventType?: string,
    userId?: string,
  ): Promise<ActivityLogRow[]> {
    return this.repository.listLogs(actor, limit, offset, eventType, userId);
  }

  trafficDashboard(
    actor: string,
    granularity: 'day' | 'month' | 'year',
    periods: number,
  ): Promise<TrafficAnalyticsDashboard> {
    return this.repository.trafficDashboard(actor, granularity, periods);
  }

  async recordRequest(input: Parameters<ActivityRepository['logRequest']>[0]): Promise<void> {
    await this.repository.logRequest(input);
  }
}
