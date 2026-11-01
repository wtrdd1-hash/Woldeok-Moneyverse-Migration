import { Controller, Get, Inject, Query, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { parseAnnouncementImageQuery } from './announcement-image-filter';

@ApiTags('content')
@Controller('content')
export class AppContentController {
  constructor(@Inject(ContentService) private readonly content: ContentService | null) {}

  private service(): ContentService {
    if (!this.content) throw new ServiceUnavailableException('content service is unavailable');
    return this.content;
  }

  @Get('announcements')
  @ApiOperation({ summary: 'App API: published announcements' })
  async announcements(@Query() query: Record<string, unknown> = {}) {
    const imageOnly = parseAnnouncementImageQuery(query);
    const announcements = await this.service().publicAnnouncements({ imageOnly });
    return imageOnly ? { announcements, filterApplied: 'with-image', sourceLimit: 20 } : { announcements };
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
