import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  Header,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { isAuthorizationFailure, isExpectedCommandFailure } from '../core/pg-error';
import {
  CatalogPurchaseDto,
  ItemConsumptionDto,
  PurchaseDto,
  UpkeepSettlementDto,
} from './shop.dto';
import { ShopCatalogRepository, ShopInputError } from './shop.repository';
import { ShopItemUnavailableError, ShopService } from './shop.service';

interface SearchableShopItem {
  readonly code?: unknown;
  readonly name?: unknown;
  readonly description?: unknown;
  readonly category?: unknown;
}

function filterShopItems<T extends SearchableShopItem>(items: readonly T[], query?: string): T[] {
  const needle = query?.trim().toLocaleLowerCase('ko-KR') ?? '';
  if (!needle) return [...items];
  return items.filter((item) =>
    [item.code, item.name, item.description, item.category]
      .filter((value): value is string => typeof value === 'string')
      .some((value) => value.toLocaleLowerCase('ko-KR').includes(needle)),
  );
}

/**
 * ShopController for Store 2.0 & Cosmetics
 */
@ApiTags('shop')
@Controller('shop')
export class ShopController {
  constructor(
    @Inject(ShopService) private readonly shop: ShopService | null,
    @Inject(ShopCatalogRepository) private readonly catalogue: ShopCatalogRepository | null,
  ) {}

  private service(): ShopService {
    if (!this.shop) throw new ServiceUnavailableException('shop service is unavailable');
    return this.shop;
  }

  private repository(): ShopCatalogRepository {
    if (!this.catalogue) throw new ServiceUnavailableException('shop catalogue is unavailable');
    return this.catalogue;
  }

  private async guarded<T>(work: () => Promise<T>, conflictMessage: string): Promise<T> {
    try {
      return await work();
    } catch (error: unknown) {
      if (error instanceof ShopInputError) throw new BadRequestException(error.message);
      if (isAuthorizationFailure(error)) throw new ForbiddenException('this receipt is not yours');
      if (isExpectedCommandFailure(error)) throw new ConflictException(conflictMessage);
      throw error;
    }
  }

  @Get('items')
  @ApiOperation({ summary: 'Items currently on sale; optional q searches name/description' })
  async items(@Query('q') query?: string) {
    return { items: filterShopItems(await this.service().catalog(), query) };
  }

  @Get('purchases')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
  @ApiOperation({ summary: 'Purchases made by the caller' })
  async purchases(@Req() request: RequestWithSession) {
    return { purchases: await this.service().myPurchases(requireUserId(request)) };
  }

  @Post('items/:id/purchases')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
  @ApiOperation({ summary: 'Buy an item' })
  async purchase(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) itemId: string,
    @Body() body: PurchaseDto,
  ) {
    try {
      return await this.service().purchase(requireUserId(request), {
        itemId,
        idempotencyKey: body.idempotencyKey,
      });
    } catch (error: unknown) {
      if (error instanceof ShopItemUnavailableError) {
        throw new NotFoundException('item is unavailable');
      }
      if (error instanceof ShopInputError) {
        throw new BadRequestException('invalid shop purchase request');
      }
      if (isExpectedCommandFailure(error)) {
        throw new ConflictException('this shop purchase cannot be completed now');
      }
      throw error;
    }
  }

  @Get('public-catalog')
  @ApiOperation({ summary: 'The public catalogue; optional q searches code/name/description/category' })
  async publicCatalog(@Query('q') query?: string) {
    const catalogItems = await this.guarded(
      () => this.repository().catalog(null),
      'the catalogue is unavailable',
    );
    return { catalogItems: filterShopItems(catalogItems, query) };
  }

  @Get('catalog')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
  @ApiOperation({ summary: 'The member catalogue; optional q searches code/name/description/category' })
  async catalog(@Req() request: RequestWithSession, @Query('q') query?: string) {
    const catalogItems = await this.guarded(
      () => this.repository().catalog(requireUserId(request)),
      'the catalogue is unavailable',
    );
    return { catalogItems: filterShopItems(catalogItems, query) };
  }

  @Get('holdings')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
  @ApiOperation({ summary: 'Catalogue items the caller holds' })
  async holdings(@Req() request: RequestWithSession) {
    return {
      holdings: await this.guarded(
        () => this.repository().holdings(requireUserId(request)),
        'held items are unavailable',
      ),
    };
  }

  @Get('holdings/upkeep-snapshot')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
  @Header('Cache-Control', 'private, no-store')
  @Header('X-Robots-Tag', 'noindex, nofollow')
  @ApiOperation({ summary: 'Complete bounded snapshot of the caller owned shop upkeep exposure' })
  async upkeepSnapshot(@Req() request: RequestWithSession) {
    const holdings = await this.guarded(
      () => this.repository().holdings(requireUserId(request)),
      'held items are unavailable',
    );
    const wld = /^(?:0|[1-9][0-9]*)$/;
    const validWld = (value: unknown): value is string =>
      typeof value === 'string' && value.length <= 19 && wld.test(value) &&
      BigInt(value) <= 9223372036854775807n;
    // Missing or malformed upkeep fields must not hide an outstanding obligation.
    if (holdings.some((holding) =>
      !validWld(holding.weekly_cost) || !validWld(holding.arrears_due) ||
      !validWld(holding.arrears_cap) || typeof holding.suspended !== 'boolean' ||
      typeof holding.unpaid_weeks !== 'number' ||
      !Number.isSafeInteger(holding.unpaid_weeks) || holding.unpaid_weeks < 0
    )) {
      throw new ServiceUnavailableException('shop upkeep exposure is not verified');
    }
    const upkeepHoldings = holdings.filter((holding) =>
      BigInt(holding.weekly_cost!) > 0n ||
      BigInt(holding.arrears_due!) > 0n ||
      holding.suspended === true
    );
    // Returning a truncated set as complete would misrepresent a member's liabilities.
    if (upkeepHoldings.length > 100) {
      throw new ServiceUnavailableException('shop upkeep export exceeds the verified snapshot limit');
    }
    return {
      upkeepHoldings: upkeepHoldings.map((holding) => ({
        catalog_id: holding.catalog_id,
        code: holding.code,
        name: holding.name,
        category: holding.category,
        quantity: holding.quantity,
        weekly_cost: holding.weekly_cost,
        arrears_due: holding.arrears_due,
        arrears_cap: holding.arrears_cap,
        unpaid_weeks: holding.unpaid_weeks,
        suspended: holding.suspended,
        acquired_at: holding.acquired_at,
        expires_at: holding.expires_at,
        effect_expires_at: holding.effect_expires_at,
      })),
      complete: true,
      generatedAt: new Date().toISOString(),
    };
  }

  @Post('catalog/:id/purchases')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
  @ApiOperation({ summary: 'Buy a catalogue item' })
  async purchaseCatalogItem(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) catalogId: string,
    @Body() body: CatalogPurchaseDto,
  ) {
    return this.guarded(
      () =>
        this.repository().purchase(
          body.idempotencyKey,
          requireUserId(request),
          catalogId,
          body.quantity,
        ),
      'this item cannot be bought now',
    );
  }

  @Post('holdings/:id/equip')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
  @ApiOperation({ summary: 'Equip or unequip a held cosmetic item' })
  async equipItem(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) catalogId: string,
    @Body() body: { slot?: string; equip?: boolean },
  ) {
    return this.guarded(
      () =>
        this.repository().equipItem(
          requireUserId(request),
          catalogId,
          body.slot,
          body.equip !== false,
        ),
      'failed to equip or unequip item',
    );
  }

  @Get('cosmetics/:userId')
  @ApiOperation({ summary: 'Get active cosmetics equipped by a user' })
  async getCosmetics(@Param('userId', ParseUUIDPipe) userId: string) {
    return {
      cosmetics: await this.repository().getCosmetics(userId),
    };
  }

  @Post('holdings/:id/consumptions')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
  @ApiOperation({ summary: 'Consume one held item' })
  async consumeItem(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) catalogId: string,
    @Body() body: ItemConsumptionDto,
  ) {
    return this.guarded(
      () => this.repository().use(body.idempotencyKey, requireUserId(request), catalogId),
      'this item cannot be used now',
    );
  }

  @Post('holdings/:id/upkeep-settlements')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
  @ApiOperation({ summary: 'Pay the outstanding weekly upkeep on one held item' })
  async settleUpkeep(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) catalogId: string,
    @Body() body: UpkeepSettlementDto,
  ) {
    return this.guarded(
      () => this.repository().settleUpkeep(body.idempotencyKey, requireUserId(request), catalogId),
      'this upkeep cannot be settled now',
    );
  }
}
