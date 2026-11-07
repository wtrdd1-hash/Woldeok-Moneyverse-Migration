import { BadRequestException, Controller, Get, Inject, Query, ServiceUnavailableException } from '@nestjs/common';
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
  @ApiOperation({ summary: 'App API: published announcements' })
  async announcements() {
    return { announcements: await this.service().publicAnnouncements() };
  }

  @Get('photos')
  @ApiOperation({ summary: 'App API: latest approved gallery photos' })
  @ApiQuery({ name: 'sort', required: false, enum: ['caption'], description: 'Bytewise caption order within latest 24 approved photos' })
  async photos(@Query() query: Record<string, unknown> = {}) {
    if (Object.keys(query).some((key) => key !== 'sort') ||
        (query.sort !== undefined && query.sort !== 'caption')) {
      throw new BadRequestException('invalid gallery sort');
    }
    return { photos: await this.service().publicPhotos(query.sort === 'caption' ? { sort: 'caption' } : {}) };
  }

  @Get('status')
  @ApiOperation({ summary: 'App API: service status board' })
  async status() {
    return { status: await this.service().serviceStatus() };
  }
}
