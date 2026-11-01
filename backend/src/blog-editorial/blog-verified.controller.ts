import { BadRequestException, Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SkipInternalToken } from '../auth/guards/skip-internal-token.decorator';
import { BlogVerifiedRepository } from './blog-verified.repository';

@Controller('blog')
export class BlogVerifiedPublicController {
  constructor(@Inject(BlogVerifiedRepository) private readonly repository:BlogVerifiedRepository) {}

  @Get('verified')
  @SkipInternalToken()
  @ApiOperation({ summary: 'List up to 150 published verified editorials, optionally filtered by subject' })
  @ApiQuery({ name: 'topic', required: false, enum: ['ECONOMY', 'CODING', 'COMPUTER'] })
  async list(@Query() query: Record<string, unknown> = {}) {
    const keys = Object.keys(query ?? {});
    if (keys.some(key => key !== 'topic') ||
        (query.topic !== undefined && !['ECONOMY', 'CODING', 'COMPUTER'].includes(String(query.topic))) ||
        (query.topic !== undefined && typeof query.topic !== 'string')) {
      throw new BadRequestException('topic must be ECONOMY, CODING or COMPUTER');
    }
    const topic = query.topic as 'ECONOMY' | 'CODING' | 'COMPUTER' | undefined;
    // The SQL function returns at most 150 published rows; do not claim a full-archive search.
    const rows = await this.repository.list(topic);
    const posts = rows.filter(row => row.status === 'PUBLISHED' &&
      ['ECONOMY', 'CODING', 'COMPUTER'].includes(row.topic) && (!topic || row.topic === topic));
    return topic
      ? { success: true, count: posts.length, scope: 'LATEST_150_PUBLISHED' as const, posts }
      : { success: true, count: posts.length, posts };
  }

  @Get('verified/:slug')
  @SkipInternalToken()
  async bySlug(@Param('slug') slug:string) {
    if (!/^[a-z0-9-]{10,110}$/.test(slug)) return {success:false,post:null};
    const post = await this.repository.find(slug);
    return { success:!!post, post };
  }
}
