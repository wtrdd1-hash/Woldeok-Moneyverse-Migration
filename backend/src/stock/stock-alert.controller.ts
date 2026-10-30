import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, Matches, Max, Min } from 'class-validator';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { StockAlertInputError, StockAlertRepository } from './stock-alert.repository';

const CONDITIONS = [
  'price_at_or_above', 'price_at_or_below',
  'day_change_at_or_above', 'day_change_at_or_below',
] as const;

class CreateStockAlertDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly stockId!: string;

  @ApiProperty({ enum: CONDITIONS })
  @IsIn(CONDITIONS)
  readonly conditionKind!: (typeof CONDITIONS)[number];

  @ApiProperty({ required: false, type: String, description: 'Integer WLD threshold for price conditions' })
  @IsOptional()
  @IsString()
  @Matches(/^[1-9]\d{0,18}$/)
  readonly thresholdAmount?: string;

  @ApiProperty({ required: false, type: Number, minimum: -100000, maximum: 100000 })
  @IsOptional()
  @IsInt()
  @Min(-100000)
  @Max(100000)
  readonly thresholdBps?: number;

  @ApiProperty({ required: false, type: Number, minimum: 300, maximum: 604800, default: 3600 })
  @IsOptional()
  @IsInt()
  @Min(300)
  @Max(604800)
  readonly cooldownSeconds?: number;
}

@ApiTags('stocks')
@Controller('stocks/alerts')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
export class StockAlertController {
  constructor(@Inject(StockAlertRepository) private readonly alerts: StockAlertRepository | null) {}

  private repository(): StockAlertRepository {
    if (!this.alerts) throw new ServiceUnavailableException('stock alerts are unavailable');
    return this.alerts;
  }

  @Get()
  @Header('Cache-Control', 'private, no-store')
  @Header('X-Robots-Tag', 'noindex')
  @ApiOperation({ summary: 'Conditional virtual-stock alerts belonging to the caller' })
  async list(@Req() request: RequestWithSession) {
    return { alerts: await this.repository().list(requireUserId(request)) };
  }

  @Get('events')
  @Header('Cache-Control', 'private, no-store')
  @Header('X-Robots-Tag', 'noindex')
  @ApiOperation({ summary: 'Recent virtual-stock alert events belonging to the caller' })
  async events(@Req() request: RequestWithSession, @Query('limit') limit?: unknown, @Query('kind') kind?: unknown) {
    // Reject noncanonical wire values before querying the owner's event history.
    if (limit !== undefined && (typeof limit !== 'string' || !/^(?:[1-9]|[1-9][0-9]|100)$/.test(limit))) {
      throw new BadRequestException('limit must be a decimal integer between 1 and 100');
    }
    if (kind !== undefined && kind !== 'price' && kind !== 'change') {
      throw new BadRequestException('kind must be price or change when provided');
    }
    const parsed = limit === undefined ? 20 : Number(limit);
    const owner = requireUserId(request);
    return { events: await (kind === undefined
      ? this.repository().events(owner, parsed)
      : this.repository().events(owner, parsed, kind)) };
  }

  @Post()
  @Header('Cache-Control', 'private, no-store')
  @Header('X-Robots-Tag', 'noindex')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Create a server-evaluated virtual-stock alert' })
  async create(@Req() request: RequestWithSession, @Body() body: CreateStockAlertDto) {
    try {
      return await this.repository().create({ userId: requireUserId(request), ...body });
    } catch (error: unknown) {
      if (error instanceof StockAlertInputError) throw new BadRequestException(error.message);
      throw error;
    }
  }

  @Delete(':id')
  @Header('Cache-Control', 'private, no-store')
  @Header('X-Robots-Tag', 'noindex')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Delete one virtual-stock alert belonging to the caller' })
  async remove(@Req() request: RequestWithSession, @Param('id', ParseUUIDPipe) alertId: string) {
    return await this.repository().remove(requireUserId(request), alertId);
  }
}
