import { BadRequestException, Body, Controller, Get, Inject, Post, Query, Req, ServiceUnavailableException, UseGuards } from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { StockCommunityService } from './stock-community.service';

class CreateStockPostDto {
  @ApiProperty({ maxLength: 120 }) @IsString() @MinLength(1) @MaxLength(120) readonly title!: string;
  @ApiProperty({ maxLength: 5000 }) @IsString() @MinLength(1) @MaxLength(5000) readonly body!: string;
  @ApiProperty({ format: 'uuid' }) @IsUUID() readonly idempotencyKey!: string;
  @ApiProperty({ required: false }) @IsOptional() @Matches(/^[0-9a-f-]{36}\.(png|jpg|webp)$/) readonly imageStorageKey?: string;
  @ApiProperty({ required: false, maxLength: 300 }) @IsOptional() @IsString() @MinLength(1) @MaxLength(300) readonly imageAltText?: string;
  @ApiProperty({ example: 'WDX' }) @Matches(/^[A-Za-z0-9._-]{1,16}$/) readonly stockSymbol!: string;
  @ApiProperty({ enum: ['analysis','question','journal','business','system'] }) @IsIn(['analysis','question','journal','business','system']) readonly category!: 'analysis'|'question'|'journal'|'business'|'system';
  @ApiProperty({ enum: ['bullish','neutral','bearish','none'] }) @IsIn(['bullish','neutral','bearish','none']) readonly stance!: 'bullish'|'neutral'|'bearish'|'none';
  @ApiProperty({ enum: ['holder','no_position','operator_related','undisclosed'] }) @IsIn(['holder','no_position','operator_related','undisclosed']) readonly positionDisclosure!: 'holder'|'no_position'|'operator_related'|'undisclosed';
}

@ApiTags('board')
@Controller('board/stock-posts')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
export class StockCommunityController {
  constructor(@Inject(StockCommunityService) private readonly community: StockCommunityService | null) {}
  private service() { if (!this.community) throw new ServiceUnavailableException('stock community is unavailable'); return this.community; }
  @Post() @UseGuards(CsrfGuard)
  async create(@Req() request: RequestWithSession, @Body() body: CreateStockPostDto) {
    return { post: await this.service().create({ actorUserId: requireUserId(request), ...body }) };
  }
}

@ApiTags('board')
@Controller('board/public/stock-posts')
export class PublicStockCommunityController {
  constructor(@Inject(StockCommunityService) private readonly community: StockCommunityService | null) {}
  @Get()
  async list(@Query() query: Record<string, unknown>) {
    if (Object.keys(query).some((key) => key !== 'stock' && key !== 'q')) {
      throw new BadRequestException('invalid board search');
    }
    const stock = query.stock;
    const q = query.q;
    if (stock !== undefined && (typeof stock !== 'string' || !/^[A-Za-z0-9._-]{1,16}$/.test(stock.trim()))) {
      throw new BadRequestException('invalid stock symbol');
    }
    if (q !== undefined && (typeof q !== 'string' || !q.trim() || q.trim().length > 80 ||
        /[<>\u0000-\u001f\u007f]/.test(q))) {
      throw new BadRequestException('invalid board search');
    }
    if (!this.community) throw new ServiceUnavailableException('stock community is unavailable');
    return { posts: await this.community.publicList(stock as string | undefined, q as string | undefined) };
  }
}
