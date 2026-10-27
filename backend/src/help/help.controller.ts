import { BadRequestException, Body, Controller, Get, Header, Inject, NotFoundException, Param, Post, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { HelpRepository } from './help.repository';

const LOCALES = ['ko','en'] as const;
const CATEGORIES = ['account','wallet','shop','community','support'] as const;

// PostgreSQL filters on clock_timestamp() at read time. Recheck before emitting
// a response because evidence may expire during DB/network latency. The same
// NestJS boundary serves web and Android app-api clients.
function reviewIsCurrent(value: unknown, nowMs: number): boolean {
  if (!(value instanceof Date) && typeof value !== 'string') return false;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) && timestamp > nowMs;
}
class SearchHelpDto {
  @IsIn(LOCALES) readonly locale!: 'ko' | 'en';
  @IsOptional() @IsIn(CATEGORIES) readonly category?: typeof CATEGORIES[number];
  @IsOptional() @IsString() readonly query?: string;
  @IsOptional() @IsInt() @Min(1) @Max(50) readonly limit?: number;
}

@ApiTags('help')
@Controller('help')
export class HelpController {
  constructor(@Inject(HelpRepository) private readonly help: HelpRepository | null) {}
  private repo(): HelpRepository {
    // Feature stays OFF until source approval, isolated DB and release gates are verified.
    if (process.env.VERIFIED_HELP_CENTER_V1 !== 'true' || !this.help) {
      throw new ServiceUnavailableException('verified help center is unavailable');
    }
    return this.help;
  }
  @Get('categories') @Header('Cache-Control', 'no-store') @ApiOperation({ summary: 'Public verified help categories' })
  categories() { this.repo(); return { categories: [...CATEGORIES] }; }

  @Post('search') @Header('Cache-Control', 'no-store') @ApiOperation({ summary: 'Search only verified published help articles' })
  async search(@Body() body: SearchHelpDto) {
    const repo = this.repo();
    if (!body || !LOCALES.includes(body.locale) ||
      (body.category && !CATEGORIES.includes(body.category)) ||
      typeof (body.query ?? '') !== 'string' || Array.from(body.query ?? '').length > 100 ||
      !Number.isInteger(body.limit ?? 20) || (body.limit ?? 20) < 1 || (body.limit ?? 20) > 50) {
      throw new BadRequestException('invalid help search parameters');
    }
    const articles = await repo.search(body.locale, body.category ?? null, body.query ?? '', body.limit ?? 20);
    const nowMs = Date.now();
    return { articles: articles.filter(row => reviewIsCurrent(row.reviewed_until, nowMs)) };
  }
  @Get('articles/:locale/:slug') @Header('Cache-Control', 'no-store') @ApiOperation({ summary: 'Read a verified public help article' })
  async article(@Param('locale') locale: string, @Param('slug') slug: string) {
    const repo = this.repo();
    if (!LOCALES.includes(locale as 'ko'|'en') || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100) {
      throw new NotFoundException('help article not found');
    }
    const article = await repo.article(locale, slug);
    if (!article || !reviewIsCurrent(article.reviewed_until, Date.now())) throw new NotFoundException('help article not found');
    return { article };
  }
}
