import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  VERSION_NEUTRAL,
  Version,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { SkipInternalToken } from '../auth/guards/skip-internal-token.decorator';
import { SeoService } from './seo.service';

export interface CrawlerLogDto {
  readonly botName: string;
  readonly path: string;
  readonly statusCode?: number | undefined;
  readonly durationMs?: number | undefined;
  readonly ipAddress?: string | undefined;
  readonly userAgent?: string | undefined;
}

export interface SubmitUrlsDto {
  readonly urls?: readonly string[];
}

@ApiTags('seo')
@Controller('seo')
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get SEO crawler metrics, index health, and recent bot logs' })
  async getStatus() {
    return this.seoService.getSeoMetrics();
  }

  @Post('submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit sitemap and canonical URLs to IndexNow and Google/Naver Pings' })
  async submitUrls(@Body() body: SubmitUrlsDto) {
    return this.seoService.submitUrls(body.urls);
  }

  @Post('log')
  @HttpCode(HttpStatus.OK)
  @SkipInternalToken()
  @ApiOperation({ summary: 'Record a crawler visit from middleware or edge loggers' })
  async logCrawlerHit(@Body() body: CrawlerLogDto, @Req() req: Request) {
    const ip = body.ipAddress || (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
    const userAgent = body.userAgent || (req.headers['user-agent'] as string) || '';

    return this.seoService.recordHit({
      botName: body.botName,
      path: body.path,
      statusCode: body.statusCode,
      durationMs: body.durationMs,
      ipAddress: ip,
      userAgent,
    });
  }

  @Get('indexnow-key')
  @ApiOperation({ summary: 'Get IndexNow verification key information' })
  getIndexNowKeyInfo() {
    const key = this.seoService.getIndexNowKey();
    const base = (process.env.APP_BASE_URL || 'https://easy-scraping.com').replace(/\/$/, '');
    return {
      key,
      keyLocation: `${base}/${key}.txt`,
      wellKnownLocation: `${base}/.well-known/indexnow.key`,
    };
  }
}

/**
 * Controller for raw IndexNow verification key serving at root /.well-known/indexnow.key
 */
@Controller({ path: '.well-known/indexnow.key', version: VERSION_NEUTRAL })
@SkipInternalToken()
export class IndexNowKeyController {
  constructor(private readonly seoService: SeoService) {}

  @Get()
  @Version(VERSION_NEUTRAL)
  @Header('Content-Type', 'text/plain; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=86400')
  @ApiOperation({ summary: 'IndexNow host verification key file' })
  serveKey(): string {
    return this.seoService.getIndexNowKey();
  }
}
