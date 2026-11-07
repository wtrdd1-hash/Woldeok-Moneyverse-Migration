import { parseAnnouncementOrder } from './announcement-order';
import { Controller, Get, Inject, Query, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ContentService } from './content.service';

@ApiTags('content')
@Controller('content')
export class AppContentController {
  constructor(@Inject(ContentService) private readonly content: ContentService | null) {}

  private service(): ContentService {
    if (!this.content) throw new ServiceUnavailableException('content service is unavailable');
    return this.content;
  }

  @Get('announcements')
  @ApiQuery({ name: 'sort', required: false, enum: ['pinned', 'newest', 'oldest'] })
  @ApiOperation({ summary: 'App API: published announcements' })
  async announcements(@Query() query: Record<string, unknown> = {}) {
    return { announcements: await this.service().publicAnnouncements({ sort: parseAnnouncementOrder(query) }) };
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
