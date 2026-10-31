import { Controller, Get, Inject, Query, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { parseAnnouncementSearch } from './announcement-search';

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
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Title search within latest 20 published announcements (2–40 characters)' })
  async announcements(@Query() query: Record<string, unknown> = {}) {
    const q = parseAnnouncementSearch(query);
    return { announcements: await this.service().publicAnnouncements(q === null ? {} : { q }) };
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
