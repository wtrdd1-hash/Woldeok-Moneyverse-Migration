import { BadRequestException, Body, Controller, Get, Header, Inject, NotFoundException, Param, Post, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { HelpRepository } from './help.repository';

const LOCALES = ['ko','en'] as const;
const CATEGORIES = ['account','wallet','shop','community','support'] as const;
class SearchHelpDto {
  @IsIn(LOCALES) readonly locale!: 'ko' | 'en';
  @IsOptional() @IsIn(CATEGORIES) readonly category?: typeof CATEGORIES[number];
  @IsOptional() @IsString() readonly query?: string;
  @IsOptional() @IsInt() @Min(1) @Max(50) readonly limit?: number;
  @IsOptional() @IsBoolean() readonly fallbackToOtherLocale?: boolean;
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
      !Number.isInteger(body.limit ?? 20) || (body.limit ?? 20) < 1 || (body.limit ?? 20) > 50 ||
      (body.fallbackToOtherLocale !== undefined && typeof body.fallbackToOtherLocale !== 'boolean')) {
      throw new BadRequestException('invalid help search parameters');
    }
    const category = body.category ?? null;
    const query = body.query ?? '';
    const limit = body.limit ?? 20;
    // The database function independently enforces publication, review and expiry.
    // Do not silently translate, merge languages or fall back on a DB failure.
    const primary = await repo.search(body.locale, category, query, limit);
    if (primary.length || body.fallbackToOtherLocale !== true) {
      return { articles: primary, requestedLocale: body.locale, resultLocale: body.locale, fallbackUsed: false };
    }
    const otherLocale = body.locale === 'ko' ? 'en' : 'ko';
    const alternate = await repo.search(otherLocale, category, query, limit);
    return { articles: alternate, requestedLocale: body.locale,
      resultLocale: alternate.length ? otherLocale : body.locale, fallbackUsed: alternate.length > 0 };
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
