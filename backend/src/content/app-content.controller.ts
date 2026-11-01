import { Controller, Get, Inject, Query, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ContentService, type ContentPhoto } from './content.service';
import { parsePhotoMonth } from './photo-month';

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
  @ApiQuery({ name: 'month', required: false, type: String, description: 'Seoul publication month YYYY-MM, within latest 24 approved photos' })
  async photos(@Query() query: Record<string, unknown> = {}): Promise<{ photos: ContentPhoto[]; month?: string }> {
    const month = parsePhotoMonth(query);
    const photos = await this.service().publicPhotos(month === null ? {} : { month });
    return month === null ? { photos } : { photos, month };
  }

  @Get('status')
  @ApiOperation({ summary: 'App API: service status board' })
  async status() {
    return { status: await this.service().serviceStatus() };
  }
}
