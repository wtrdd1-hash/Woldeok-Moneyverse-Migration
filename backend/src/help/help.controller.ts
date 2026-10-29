import { BadRequestException, Body, Controller, Get, Header, Inject, NotFoundException, Param, Post, Query, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { HelpRepository } from './help.repository';

const LOCALES = ['ko','en'] as const;
const CATEGORIES = ['account','wallet','shop','community','support'] as const;
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
  async categories(@Query('locale') locale = 'ko') {
    const repo = this.repo();
    if (!LOCALES.includes(locale as 'ko'|'en')) throw new BadRequestException('invalid help locale');
    const rows = await repo.categoryCounts(locale);
    const counts = Object.fromEntries(CATEGORIES.map(category =>
      [category, rows.find(row => row.category === category)?.article_count ?? '0']));
    return { categories: [...CATEGORIES], counts, locale };
  }

  @Post('search') @Header('Cache-Control', 'no-store') @ApiOperation({ summary: 'Search only verified published help articles' })
  async search(@Body() body: SearchHelpDto) {
    const repo = this.repo();
    if (!body || !LOCALES.includes(body.locale) ||
      (body.category && !CATEGORIES.includes(body.category)) ||
      typeof (body.query ?? '') !== 'string' || Array.from(body.query ?? '').length > 100 ||
      !Number.isInteger(body.limit ?? 20) || (body.limit ?? 20) < 1 || (body.limit ?? 20) > 50) {
      throw new BadRequestException('invalid help search parameters');
    }
    return { articles: await repo.search(body.locale, body.category ?? null, body.query ?? '', body.limit ?? 20) };
  }
  @Get('articles/:locale/:slug/related') @Header('Cache-Control', 'no-store') @ApiOperation({ summary: 'Related currently approved help articles in the same locale and category' })
  async related(@Param('locale') locale: string, @Param('slug') slug: string) {
    const repo = this.repo();
    if (!LOCALES.includes(locale as 'ko'|'en') || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100) {
      throw new NotFoundException('help article not found');
    }
    // Never reveal related articles for an expired/retracted/nonexistent source.
    try {
      const current = await repo.article(locale, slug);
      if (!current) throw new NotFoundException('help article not found');
      // Both functions are existing approved-only SECURITY DEFINER reads (migration 282).
      const rows = await repo.search(locale, current.category, '', 8);
      return { articles: rows.filter(row => row.article_id !== current.article_id &&
        row.locale === locale && row.category === current.category).slice(0, 5) };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new ServiceUnavailableException('verified related help is unavailable');
    }
  }
  @Get('articles/:locale/:slug') @Header('Cache-Control', 'no-store') @ApiOperation({ summary: 'Read a verified public help article' })
  async article(@Param('locale') locale: string, @Param('slug') slug: string) {
    const repo = this.repo();
    if (!LOCALES.includes(locale as 'ko'|'en') || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100) {
      throw new NotFoundException('help article not found');
    }
    const article = await repo.article(locale, slug);
    if (!article) throw new NotFoundException('help article not found');
    return { article };
  }
}
