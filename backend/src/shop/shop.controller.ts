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
import { compareShopCatalog, parseShopCompareIds, ShopCompareUnavailableError } from './shop-compare';
import { orderShopCatalog, parseShopPriceOrder, type ShopPriceOrder } from './shop-catalog-order';
import { filterShopByMaxPrice, parseShopMaxPrice } from './shop-price-ceiling';

interface SearchableShopItem {
  readonly code?: unknown;
  readonly name?: unknown;
  readonly description?: unknown;
  readonly category?: unknown;
}

export function parseShopCategory(value: unknown): string | null {
  if (value === undefined || value === '') return null;
  // A category is a database enum-like token, not a user-supplied search expression.
  if (typeof value !== 'string' || !/^[a-z][a-z0-9_]{0,39}$/.test(value)) {
    throw new BadRequestException('invalid shop category');
  }
  return value;
}

export function filterShopItems<T extends SearchableShopItem>(
  items: readonly T[],
  query?: string,
  category?: string | null,
): T[] {
  const needle = query?.trim().toLocaleLowerCase('ko-KR') ?? '';
  return items.filter((item) =>
    (!category || item.category === category) &&
    (!needle || [item.code, item.name, item.description, item.category]
      .filter((value): value is string => typeof value === 'string')
      .some((value) => value.toLocaleLowerCase('ko-KR').includes(needle))),
  );
}

/**
 * ShopController for Store 2.0 & Cosmetics
 */
@ApiTags('shop')
@Controller('shop')
export class ShopController {
  constructor(
    @Inject(ShopService) private readonly shopService: ShopService | null,
    @Inject(ShopCatalogRepository) private readonly catalogRepository: ShopCatalogRepository | null,
  ) {}

  private service(): ShopService {
    if (!this.shopService) {
      throw new ServiceUnavailableException('shop service is unavailable');
    }
    return this.shopService;
  }

  private repository(): ShopCatalogRepository {
    if (!this.catalogRepository) {
      throw new ServiceUnavailableException('shop catalogue is unavailable');
    }
    return this.catalogRepository;
  }

  private async guarded<T>(read: () => Promise<T>, message: string): Promise<T> {
    try {
      return await read();
    } catch (error: unknown) {
      if (
        error instanceof ServiceUnavailableException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      if (isAuthorizationFailure(error)) {
        throw new ForbiddenException(message);
      }
      throw new ServiceUnavailableException(message);
    }
  }

  @Get('categories')
  @ApiOperation({ summary: 'List available item categories' })
  async getCategories() {
    return {
      categories: await this.repository().getCategories(),
    };
  }

  @Get('items')
  @ApiOperation({ summary: 'Items currently on sale; optional q searches name/description' })
  async items(@Query('q') query?: string, @Query('maxPrice') maxPrice?: unknown) {
    return { items: await this.guarded(async () => {
      let ceiling: bigint | null = null;
      if (maxPrice !== undefined) {
        try {
          ceiling = parseShopMaxPrice(maxPrice);
        } catch (e: unknown) {
          if (e instanceof ShopInputError) throw new BadRequestException(e.message);
          throw e;
        }
      }
      return filterShopByMaxPrice(filterShopItems(await this.service().catalog(), query), ceiling);
    }, 'the catalogue is unavailable') };
  }

  @Get('purchases')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
  @ApiOperation({ summary: 'Purchase history for the authenticated user' })
  async purchases(@Req() request: RequestWithSession) {
    return {
      purchases: await this.service().purchasesForUser(requireUserId(request)),
    };
  }

  @Post('purchases')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard)
  @ApiOperation({ summary: 'Buy an item from the shop' })
  async purchase(@Req() request: RequestWithSession, @Body() body: PurchaseDto) {
    try {
      return await this.service().purchase({
        idempotencyKey: body.idempotencyKey,
        buyerUserId: requireUserId(request),
        shopItemId: body.shopItemId,
      });
    } catch (error: unknown) {
      if (error instanceof ShopItemUnavailableError) {
        throw new NotFoundException('shop item is unavailable');
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
  @ApiOperation({ summary: 'The public catalogue; optional q, maxPrice, sort and category' })
  async publicCatalog(
    @Query('q') query?: string,
    @Query('maxPrice') maxPrice?: unknown,
    @Query('sort') sort?: string,
    @Query('category') category?: string,
  ) {
    let ceiling: bigint | null = null;
    let order: ShopPriceOrder = 'default';
    if (typeof maxPrice === 'string' && (maxPrice === 'price_asc' || maxPrice === 'price_desc')) {
      order = maxPrice;
    } else if (maxPrice !== undefined) {
      try {
        ceiling = parseShopMaxPrice(maxPrice);
      } catch (e: unknown) {
        if (e instanceof ShopInputError) throw new BadRequestException(e.message);
        throw e;
      }
    }
    if (sort) {
      order = parseShopPriceOrder(sort);
    }
    const selectedCategory = parseShopCategory(category);
    let catalogItems = await this.guarded(
      () => this.repository().catalog(null),
      'the catalogue is unavailable',
    );
    catalogItems = filterShopItems(catalogItems, query, selectedCategory);
    if (ceiling !== null) {
      catalogItems = filterShopByMaxPrice(catalogItems, ceiling);
    }
    if (order !== 'default') {
      catalogItems = orderShopCatalog(catalogItems as any, order);
    }
    return { catalogItems };
  }

  @Get('catalog')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
  @ApiOperation({ summary: 'The member catalogue; optional q, maxPrice/ownership, sort, category' })
  async catalog(
    @Req() request: RequestWithSession,
    @Query('q') query?: string,
    @Query('maxPrice') maxPriceOrOwnership?: unknown,
    @Query('sort') sort?: string,
    @Query('category') category?: string,
  ) {
    let ceiling: bigint | null = null;
    let ownershipFilter: 'owned' | 'unowned' | null = null;
    let order: ShopPriceOrder = 'default';

    if (maxPriceOrOwnership === 'owned' || maxPriceOrOwnership === 'unowned') {
      ownershipFilter = maxPriceOrOwnership;
    } else if (typeof maxPriceOrOwnership === 'string' && (maxPriceOrOwnership === 'price_asc' || maxPriceOrOwnership === 'price_desc')) {
      order = maxPriceOrOwnership;
    } else if (maxPriceOrOwnership !== undefined) {
      try {
        ceiling = parseShopMaxPrice(maxPriceOrOwnership);
      } catch (e: unknown) {
        if (e instanceof ShopInputError) throw new BadRequestException(e.message);
        throw e;
      }
    }

    if (sort) {
      order = parseShopPriceOrder(sort);
    }

    const selectedCategory = parseShopCategory(category);
    let catalogItems = await this.guarded(
      () => this.repository().catalog(requireUserId(request)),
      'the catalogue is unavailable',
    );

    catalogItems = filterShopItems(catalogItems, query, selectedCategory);
    if (ceiling !== null) {
      catalogItems = filterShopByMaxPrice(catalogItems, ceiling);
    }
    if (ownershipFilter === 'owned') {
      catalogItems = catalogItems.filter((item: any) => Number(item.user_owned_quantity ?? 0) > 0);
    } else if (ownershipFilter === 'unowned') {
      catalogItems = catalogItems.filter((item: any) => Number(item.user_owned_quantity ?? 0) === 0);
    }
    if (order !== 'default') {
      catalogItems = orderShopCatalog(catalogItems as any, order);
    }

    return { catalogItems };
  }

  @Get('compare')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
  @ApiOperation({ summary: 'Compare two current catalogue prices for the authenticated member' })
  async compare(@Req() request: RequestWithSession, @Query('ids') ids: unknown) {
    let selected: readonly [string, string];
    try {
      selected = parseShopCompareIds(ids);
    } catch (error: unknown) {
      if (error instanceof ShopInputError) throw new BadRequestException(error.message);
      throw error;
    }
    const rows = await this.guarded(
      () => this.repository().catalog(requireUserId(request)),
      'the catalogue is unavailable',
    );
    try {
      return compareShopCatalog(rows, selected);
    } catch (error: unknown) {
      if (error instanceof ShopCompareUnavailableError) throw new NotFoundException('one or more items are unavailable');
      throw error;
    }
  }

  @Get('holdings')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
  @ApiOperation({ summary: 'Catalogue items the caller holds' })
  async holdings(@Req() request: RequestWithSession, @Query('filter') filter?: unknown) {
    if (filter !== undefined && filter !== 'attention') {
      throw new BadRequestException('invalid holdings filter');
    }
    let items = await this.guarded(
      () => this.repository().holdings(requireUserId(request)),
      'held items are unavailable',
    );
    if (filter === 'attention') {
      items = items.filter((item: any) => item.suspended === true || Number(item.unpaid_weeks ?? 0) > 0);
    }
    return { holdings: items };
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
