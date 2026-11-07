import { BadRequestException, Controller, Get, Inject, Query, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { ContentInputError, parsePhotoCaptionQuery } from './content.repository';

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
  @ApiQuery({ name: 'q', required: false, type: String,
    description: 'Literal case-insensitive caption substring (2-60 characters) within the latest 24 approved photos' })
  async photos(@Query() query: Record<string, unknown> = {}) {
    try {
      return { photos: await this.service().publicPhotos({ caption: parsePhotoCaptionQuery(query) }) };
    } catch (error: unknown) {
      if (error instanceof ContentInputError) throw new BadRequestException(error.message);
      throw error;
    }
  }

  @Get('status')
  @ApiOperation({ summary: 'App API: service status board' })
  async status() {
    return { status: await this.service().serviceStatus() };
  }
}
