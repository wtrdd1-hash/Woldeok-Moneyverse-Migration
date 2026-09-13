import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
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
  @ApiOperation({ summary: 'Conditional virtual-stock alerts belonging to the caller' })
  async list(@Req() request: RequestWithSession) {
    return { alerts: await this.repository().list(requireUserId(request)) };
  }

  @Get('events')
  @ApiOperation({ summary: 'Recent virtual-stock alert events belonging to the caller' })
  async events(@Req() request: RequestWithSession, @Query('limit') limit?: string) {
    const parsed = limit === undefined ? 20 : Number(limit);
    if (!Number.isSafeInteger(parsed)) throw new BadRequestException('limit must be a whole number');
    return { events: await this.repository().events(requireUserId(request), parsed) };
  }

  @Post()
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
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Delete one virtual-stock alert belonging to the caller' })
  async remove(@Req() request: RequestWithSession, @Param('id', ParseUUIDPipe) alertId: string) {
    return await this.repository().remove(requireUserId(request), alertId);
  }
}
