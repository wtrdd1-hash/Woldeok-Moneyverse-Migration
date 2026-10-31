import { Controller, Get, Inject, Query, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { parseGalleryCaptionQuery } from './gallery-alt-search';

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
  async announcements() {
    return { announcements: await this.service().publicAnnouncements() };
  }

  @Get('photos')
  @ApiOperation({ summary: 'App API: published gallery photos' })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Caption substring, 2-40 printable characters; searches the newest 24 approved photos only' })
  async photos(@Query('q') raw?: unknown) {
    const query = parseGalleryCaptionQuery(raw);
    return {
      photos: await this.service().publicPhotos({ query }),
      searchScope: 'latest_24' as const,
      ...(query ? { searchApplied: true } : {}),
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'App API: service status board' })
  async status() {
    return { status: await this.service().serviceStatus() };
  }
}
