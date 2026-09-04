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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsPositive, IsUUID } from 'class-validator';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { isExpectedCommandFailure } from '../core/pg-error';
import { StockInputError, isCandleInterval } from './stock.repository';
import { StockService } from './stock.service';

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
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
export class StockController {
  constructor(@Inject(StockService) private readonly stocks: StockService | null) {}

  private service(): StockService {
    if (!this.stocks) throw new ServiceUnavailableException('stock service is unavailable');
    return this.stocks;
  }

  @Get()
  @ApiOperation({ summary: 'Listed stocks and their current prices' })
  async list() {
    return { stocks: await this.service().list() };
  }

  @Get('portfolio')
  @ApiOperation({ summary: 'Holdings of the caller' })
  async portfolio(@Req() request: RequestWithSession) {
    return { holdings: await this.service().portfolio(requireUserId(request)) };
  }

  @Get('history')
  @ApiOperation({ summary: 'Trades made by the caller' })
  async history(@Req() request: RequestWithSession) {
    return { trades: await this.service().history(requireUserId(request)) };
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
  @ApiOperation({ summary: 'Recent prices for every listed stock' })
  async sparklines(@Query('limit') limit?: string) {
    const requested = limit === undefined ? undefined : Number(limit);
    if (requested !== undefined && !Number.isSafeInteger(requested)) {
      throw new BadRequestException('limit must be a whole number');
    }
    return { series: await this.service().sparkSeries(requested) };
  }

  /**
   * The news that is moving the market (124): every event that is running,
   * for one stock or the whole market. A member reads the direction the
   * market is leaning and why; the figures behind it stay in the console.
   */
  @Get('market-events')
  @ApiOperation({ summary: 'Market events currently in effect' })
  async marketEvents() {
    return { events: await this.service().marketEvents() };
  }

  /** `limit` bounds the series, 1 to 240; the repository clamps it. */
  @Get(':id/prices')
  @ApiOperation({ summary: 'Recorded price history for one stock' })
  async prices(@Param('id', ParseUUIDPipe) stockId: string, @Query('limit') limit?: string) {
    const requested = limit === undefined ? undefined : Number(limit);
    if (requested !== undefined && !Number.isSafeInteger(requested)) {
      throw new BadRequestException('limit must be a whole number');
    }
    return { prices: await this.service().priceHistory(stockId, requested) };
  }

  /**
   * Candles at the requested width, and the highs and lows that go beside
   * them.
   *
   * One route rather than two: the detail chart draws nothing useful with
   * half of this, so asking for half would only ever be a mistake. The range
   * does not depend on the width — a year's high is a year's high however the
   * chart is bucketed — so it is returned unchanged as the reader switches.
   */
  @Get(':id/candles')
  @ApiOperation({ summary: 'Open/high/low/close for one stock at a given interval' })
  async candles(
    @Param('id', ParseUUIDPipe) stockId: string,
    @Query('interval') interval?: string,
    @Query('limit') limit?: string,
  ) {
    const seconds = interval === undefined ? 86400 : Number(interval);
    const count = limit === undefined ? undefined : Number(limit);
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
  @UseGuards(CsrfGuard)
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
