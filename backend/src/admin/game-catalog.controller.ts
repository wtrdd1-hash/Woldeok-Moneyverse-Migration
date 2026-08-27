import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { isExpectedCommandFailure } from '../core/pg-error';
import { StockInputError } from '../stock/stock.repository';
import { StockService } from '../stock/stock.service';
import { GameCatalogInputError, PostgresGameCatalogRepository } from './game-catalog.repository';

export class CreateStockDto {
  @ApiProperty({ maxLength: 12 })
  @IsString()
  @MinLength(1)
  @MaxLength(12)
  readonly symbol!: string;

  @ApiProperty({ maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  readonly name!: string;

  @ApiProperty({ required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly description?: string;

  @ApiProperty({ type: Number, minimum: 1 })
  @IsInt()
  @IsPositive()
  readonly price!: number;
}

export class UpdateCatalogEntryDto {
  @ApiProperty({ required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly name?: string;

  @ApiProperty({ required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  readonly active?: boolean;
}

export class CorporateActionDto {
  @ApiProperty({ enum: ['split', 'reverse_split'] })
  @IsIn(['split', 'reverse_split'])
  readonly action!: string;

  @ApiProperty({ type: Number, minimum: 1 })
  @IsInt()
  @IsPositive()
  readonly factor!: number;

  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  readonly idempotencyKey?: string;
}

export class CreateSeasonEventDto {
  @ApiProperty({ maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  readonly title!: string;

  @ApiProperty({ required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly description?: string;

  @ApiProperty({ type: Number, minimum: 1 })
  @IsInt()
  @IsPositive()
  readonly costWld!: number;

  @ApiProperty({ type: Number, minimum: 1 })
  @IsInt()
  @IsPositive()
  readonly pointsPerEntry!: number;
}

export class UpdateSeasonEventDto {
  @ApiProperty({ required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly title?: string;

  @ApiProperty({ required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  readonly active?: boolean;
}

/**
 * The operator console for stocks, business types and season events.
 *
 * Every method passes the caller's id to the database, and each function
 * behind it performs its own operator check through `game_catalog_operator`.
 * AdminGuard here decides who reaches the controller; the function decides
 * who may act — one is not a substitute for the other, and the bounds on
 * every value below are checked again in SQL.
 */
@ApiTags('admin')
@Controller('admin')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard)
export class GameCatalogController {
  constructor(
    @Inject(StockService) private readonly stocks: StockService | null,
    @Inject(PostgresGameCatalogRepository)
    private readonly catalog: PostgresGameCatalogRepository | null,
  ) {}

  private stockService(): StockService {
    if (!this.stocks) throw new ServiceUnavailableException('stock service is unavailable');
    return this.stocks;
  }

  private catalogRepository(): PostgresGameCatalogRepository {
    if (!this.catalog) throw new ServiceUnavailableException('game catalog is unavailable');
    return this.catalog;
  }

  private async guarded<T>(work: () => Promise<T>, message: string): Promise<T> {
    try {
      return await work();
    } catch (error: unknown) {
      if (error instanceof StockInputError || error instanceof GameCatalogInputError) {
        throw new BadRequestException(error.message);
      }
      if (isExpectedCommandFailure(error)) throw new BadRequestException(message);
      throw error;
    }
  }

  @Get('stocks')
  @ApiOperation({ summary: 'Every stock, including inactive ones' })
  async stockList(@Req() request: RequestWithSession) {
    return { stocks: await this.stockService().adminList(requireUserId(request)) };
  }

  @Post('stocks')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'List a new stock' })
  createStock(@Req() request: RequestWithSession, @Body() body: CreateStockDto) {
    return this.guarded(
      () => this.stockService().create({ userId: requireUserId(request), ...body }),
      'invalid stock',
    );
  }

  @Patch('stocks/:id')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Rename, redescribe or deactivate a stock' })
  updateStock(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) stockId: string,
    @Body() body: UpdateCatalogEntryDto,
  ) {
    return this.guarded(
      () => this.stockService().update({ userId: requireUserId(request), stockId, ...body }),
      'invalid stock update',
    );
  }

  @Post('stocks/:id/corporate-actions')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Apply a split or reverse split' })
  corporateAction(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) stockId: string,
    @Body() body: CorporateActionDto,
  ) {
    return this.guarded(
      () =>
        this.stockService().corporateAction({
          userId: requireUserId(request),
          stockId,
          ...body,
        }),
      'invalid corporate action',
    );
  }

  @Get('business-types')
  @ApiOperation({ summary: 'Every business type, including inactive ones' })
  async businessTypes(@Req() request: RequestWithSession) {
    return { businessTypes: await this.catalogRepository().businesses(requireUserId(request)) };
  }

  @Patch('business-types/:id')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Rename, redescribe or deactivate a business type' })
  updateBusinessType(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) businessTypeId: string,
    @Body() body: UpdateCatalogEntryDto,
  ) {
    return this.guarded(
      () => this.catalogRepository().updateBusiness(requireUserId(request), businessTypeId, body),
      'invalid business update',
    );
  }

  @Get('season-events')
  @ApiOperation({ summary: 'Every season event, including inactive ones' })
  async seasonEvents(@Req() request: RequestWithSession) {
    return { events: await this.catalogRepository().events(requireUserId(request)) };
  }

  @Post('season-events')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Create a season event in the active season' })
  createSeasonEvent(@Req() request: RequestWithSession, @Body() body: CreateSeasonEventDto) {
    return this.guarded(
      () => this.catalogRepository().createEvent(requireUserId(request), body),
      'invalid season event',
    );
  }

  @Patch('season-events/:id')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Retitle, redescribe or deactivate a season event' })
  updateSeasonEvent(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) eventId: string,
    @Body() body: UpdateSeasonEventDto,
  ) {
    return this.guarded(
      () => this.catalogRepository().updateEvent(requireUserId(request), eventId, body),
      'invalid season event update',
    );
  }
}
