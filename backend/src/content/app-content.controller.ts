import { Controller, Get, Inject, Query, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { parseAnnouncementRecency } from './announcement-recency';

@ApiTags('content')
@Controller('content')
export class AppContentController {
  constructor(@Inject(ContentService) private readonly content: ContentService | null) {}

  private service(): ContentService {
    if (!this.content) throw new ServiceUnavailableException('content service is unavailable');
    return this.content;
  }

  @Get('announcements')
  @ApiOperation({ summary: 'App API: published announcements by publication age' })
  async announcements(@Query('recent') recentValue?: unknown) {
    const recent = parseAnnouncementRecency(recentValue);
    const asOf = new Date();
    return {
      announcements: await this.service().publicAnnouncements({ recent, asOf }),
      recentApplied: recent,
      asOfUtc: asOf.toISOString(),
      scope: 'latest-20-published',
    };
  }

  @Get('photos')
  @ApiOperation({ summary: 'App API: published gallery photos' })
  async photos() {
    return { photos: await this.service().publicPhotos() };
  }

  @Get('status')
  @ApiOperation({ summary: 'App API: service status board' })
  async status() {
    return { status: await this.service().serviceStatus() };
  }
}
