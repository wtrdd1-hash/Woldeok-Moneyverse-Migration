import { BadRequestException, Controller, Get, Inject, Query, ServiceUnavailableException } from '@nestjs/common';
import { ContentInputError } from './content.repository';
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
  @ApiQuery({ name: 'day', required: false, description: 'Seoul publication day YYYY-MM-DD, latest 20 only' })
  async announcements(@Query() query: Record<string, unknown> = {}) {
    if (Object.keys(query).some((key) => key !== 'day')) {
      throw new BadRequestException('unsupported announcement query');
    }
    try {
      const announcements = await this.service().publicAnnouncements({ day: query.day });
      return { announcements, ...(query.day !== undefined ? { publicationDay: query.day as string } : {}) };
    } catch (error: unknown) {
      if (error instanceof ContentInputError) throw new BadRequestException(error.message);
      throw error;
    }
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
