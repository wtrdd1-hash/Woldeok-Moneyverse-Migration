import {
  Query,
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsPositive, IsUUID } from 'class-validator';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { isExpectedCommandFailure } from '../core/pg-error';
import { StockInputError, isCandleInterval } from './stock.repository';
import { StockService } from './stock.service';
import { parseWatchlistTrend } from './stock-watchlist-trend';

import { SkipInternalToken } from '../auth/guards/skip-internal-token.decorator';

/**
 * Public price endpoints must reject coercible query strings before reaching
 * the SQL read model. Repository clamps remain a separate defensive boundary.
 */
function parseStockQueryInteger(value: unknown, maximum: number, name: string): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    throw new BadRequestException(`${name} must be a decimal integer between 1 and ${maximum}`);
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed > maximum) {
    throw new BadRequestException(`${name} must be a decimal integer between 1 and ${maximum}`);
  }
  return parsed;
}

export class WatchlistDto {
  @ApiProperty({ type: Boolean })
  @IsBoolean()
  readonly watching!: boolean;
}

export class OrderDto {
  @ApiProperty({ enum: ['buy', 'sell'] })
  @IsIn(['buy', 'sell'])
  readonly side!: 'buy' | 'sell';

  @ApiProperty({ type: Number, minimum: 1 })
  @IsInt()
  @IsPositive()
  readonly quantity!: number;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

@ApiTags('stocks')
@Controller('stocks')
export class StockController {
  constructor(@Inject(StockService) private readonly stocks: StockService | null) {}

  private service(): StockService {
    if (!this.stocks) throw new ServiceUnavailableException('stock service is unavailable');
    return this.stocks;
  }

  @Get()
  @SkipInternalToken()
  @ApiOperation({ summary: 'Listed stocks and their current prices' })
  async list() {
    return { stocks: await this.service().list() };
  }

  @Get('watchlist')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
  @ApiOperation({ summary: 'Stocks watched by the caller' })
  @ApiQuery({ name: 'trend', required: false, enum: ['all', 'up', 'down', 'flat'] })
  async watchlist(@Req() request: RequestWithSession, @Query('trend') trendValue?: unknown) {
    const trend = parseWatchlistTrend(trendValue);
    if (trend === null) throw new BadRequestException('trend must be all, up, down or flat');
    return { stocks: await this.service().watchlist(requireUserId(request), trend) };
  }

  @Post(':id/watchlist')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
  @ApiOperation({ summary: 'Add or remove a stock from the caller watchlist' })
  async setWatchlist(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) stockId: string,
    @Body() body: WatchlistDto,
  ) {
    try {
      return await this.service().setWatchlist(requireUserId(request), stockId, body.watching);
    } catch (error: unknown) {
      if (error instanceof StockInputError) throw new BadRequestException(error.message);
      throw error;
    }
  }

  @Get('portfolio')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
  @ApiOperation({ summary: 'Holdings of the caller' })
  async portfolio(@Req() request: RequestWithSession) {
    return { holdings: await this.service().portfolio(requireUserId(request)) };
  }

  @Get('halt-receipts')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
  @ApiOperation({ summary: 'Stock halt cost-basis settlement receipts for caller' })
  async haltReceipts(@Req() request: RequestWithSession) {
    return { receipts: await this.service().haltSettlementReceipts(requireUserId(request)) };
  }

  @Get('history')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
  @ApiOperation({ summary: 'Trades made by the caller' })
  async history(@Req() request: RequestWithSession, @Query('limit') limit?: unknown) {
    const count = limit === undefined || limit === '50' ? 50 : limit === '100' ? 100 : limit === '200' ? 200 : null;
    if (count === null) throw new BadRequestException('limit must be 50, 100 or 200');
    return { trades: await this.service().history(requireUserId(request), count) };
  }

  /**
   * The preview series for every listed stock, in one call.
   *
   * The market screen draws a small line on each card. Asking for them one at
   * a time made the cost of the screen grow with the number of listed stocks,
   * on a page that refreshes itself while it is open. `limit` bounds each
   * series the way it does on `:id/prices`.
   */
  @Get('sparklines')
  @SkipInternalToken()
  @ApiOperation({ summary: 'Recent prices for every listed stock' })
  async sparklines(@Query('limit') limit?: string) {
    const requested = parseStockQueryInteger(limit, 240, 'limit');
    return { series: await this.service().sparkSeries(requested) };
  }

  @Get('market-events')
  @SkipInternalToken()
  @ApiOperation({ summary: 'Market events currently in effect' })
  async marketEvents() {
    return { events: await this.service().marketEvents() };
  }

  @Get(':id/prices')
  @SkipInternalToken()
  @ApiOperation({ summary: 'Recorded price history for one stock' })
  async prices(@Param('id', ParseUUIDPipe) stockId: string, @Query('limit') limit?: string) {
    const requested = parseStockQueryInteger(limit, 240, 'limit');
    return { prices: await this.service().priceHistory(stockId, requested) };
  }

  @Get(':id/candles')
  @SkipInternalToken()
  @ApiOperation({ summary: 'Open/high/low/close for one stock at a given interval' })
  async candles(
    @Param('id', ParseUUIDPipe) stockId: string,
    @Query('interval') interval?: string,
    @Query('limit') limit?: string,
  ) {
    const seconds = parseStockQueryInteger(interval, 604800, 'interval') ?? 86400;
    const count = parseStockQueryInteger(limit, 400, 'limit');
    if (!isCandleInterval(seconds)) {
      throw new BadRequestException('unsupported candle interval');
    }
    try {
      const [candles, range] = await Promise.all([
        this.service().candles(stockId, seconds, count),
        this.service().priceRange(stockId),
      ]);
      return { interval: seconds, candles, range };
    } catch (error: unknown) {
      if (error instanceof StockInputError) throw new BadRequestException(error.message);
      throw error;
    }
  }

  @Post(':id/orders')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
  @ApiOperation({ summary: 'Buy or sell a stock' })
  async order(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) stockId: string,
    @Body() body: OrderDto,
  ) {
    try {
      return await this.service().trade({
        userId: requireUserId(request),
        stockId,
        side: body.side,
        quantity: body.quantity,
        idempotencyKey: body.idempotencyKey,
      });
    } catch (error: unknown) {
      if (error instanceof StockInputError) throw new BadRequestException(error.message);
      if (isExpectedCommandFailure(error)) {
        throw new ConflictException('this trade cannot be completed now');
      }
      throw error;
    }
  }
}
