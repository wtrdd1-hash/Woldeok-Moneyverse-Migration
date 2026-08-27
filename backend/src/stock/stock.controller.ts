import {
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
import { StockInputError } from './stock.repository';
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

  @Get(':id/prices')
  @ApiOperation({ summary: 'Recorded price history for one stock' })
  async prices(@Param('id', ParseUUIDPipe) stockId: string) {
    return { prices: await this.service().priceHistory(stockId) };
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
