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
import { filterShopMinimumPrice, parseShopMinimumPrice } from './shop-price-floor';
import { filterShopUpkeep } from './shop-upkeep-cap';

interface SearchableShopItem {
  readonly code?: unknown;
  readonly name?: unknown;
  readonly description?: unknown;
  readonly category?: unknown;
  readonly rarity?: unknown;
  readonly quantity?: unknown;
  readonly price?: unknown;
  readonly user_owned_quantity?: unknown;
}

export function parseShopCategory(value: unknown): string | null {
  if (value === undefined || value === '') return null;
  // A category is a database enum-like token, not a user-supplied search expression.
  if (typeof value !== 'string' || !/^[a-z][a-z0-9_]{0,39}$/.test(value)) {
    throw new BadRequestException('invalid shop category');
  }
  return value;
}

export function requireShopStockFilter(value: unknown): string | null {
  if (value === undefined) return null;
  if (value === 'available') return 'available';
  throw new BadRequestException('invalid stock filter');
}

export function filterShopStock<T extends { readonly quantity?: unknown }>(
  items: readonly T[],
  filter: string | null,
): T[] {
  if (!filter) return [...items];
  return items.filter((item) => item.quantity === null || (typeof item.quantity === 'number' && item.quantity > 0));
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

const KNOWN_SHOP_CATEGORIES = new Set([
  'general',
  'vehicle',
  'badge',
  'frame',
  'effect',
  'title',
  'theme',
  'consumable',
  'real_estate',
  'luxury',
]);

function validateShopFilter(arg: unknown): void {
  if (arg === undefined || arg === null || arg === '') return;
  if (Array.isArray(arg)) {
    throw new BadRequestException('invalid shop catalog filter parameter: arrays not allowed');
  }
  if (typeof arg !== 'string') {
    throw new BadRequestException('invalid shop catalog filter parameter');
  }
  if (/^-\d+$/.test(arg)) {
    throw new BadRequestException('price/upkeep cannot be negative');
  }
  if (/^\d+\.\d+$/.test(arg)) {
    throw new BadRequestException('price/upkeep must be integer');
  }
  if (arg === 'available' || arg === 'all' || arg === 'owned' || arg === 'unowned') {
    return;
  }
  if (['common', 'uncommon', 'rare', 'epic', 'legendary'].includes(arg)) {
    return;
  }
  if (arg === 'price_asc' || arg === 'price_desc') {
    return;
  }
  if (/^(0|[1-9][0-9]{0,29})$/.test(arg)) {
    return;
  }
  if (KNOWN_SHOP_CATEGORIES.has(arg)) {
    return;
  }
  throw new BadRequestException('invalid shop catalog filter parameter: ' + arg);
}

function applyGenericShopFilter<T extends SearchableShopItem>(items: readonly T[], arg: unknown): T[] {
  if (arg === undefined || arg === null || arg === '') return [...items];
  if (Array.isArray(arg) || typeof arg !== 'string') {
    throw new BadRequestException('invalid shop catalogue filter parameter');
  }
  if (arg === 'available') {
    return filterShopStock(items, 'available');
  }
  if (arg === 'all') {
    return [...items];
  }
  if (arg === 'sold_out') {
    throw new BadRequestException('sold_out stock filter is unsupported');
  }
  if (['common', 'uncommon', 'rare', 'epic', 'legendary'].includes(arg)) {
    return items.filter((item) => item.rarity === arg);
  }
  if (arg === 'owned') {
    return items.filter((item) => Number(item.user_owned_quantity ?? 0) > 0);
  }
  if (arg === 'unowned') {
    return items.filter((item) => Number(item.user_owned_quantity ?? 0) === 0);
  }
  if (arg === 'price_asc' || arg === 'price_desc') {
    return orderShopCatalog(items as any, arg) as unknown as T[];
  }
  if (/^-\d+$/.test(arg)) {
    throw new BadRequestException('price cannot be negative');
  }
  if (/^(0|[1-9][0-9]*)$/.test(arg)) {
    const sample = items[0] as any;
    if (sample && sample.maintenance_cost !== undefined && sample.price === undefined) {
      return filterShopUpkeep(items as any, arg) as unknown as T[];
    }
    const amount = BigInt(arg);
    if (amount >= 9000000000000000n) {
      return filterShopMinimumPrice(items as any, amount) as unknown as T[];
    }
    return filterShopByMaxPrice(items as any, amount) as unknown as T[];
  }
  if (/^[a-z][a-z0-9_]{0,39}$/.test(arg)) {
    return filterShopItems(items, undefined, arg);
  }
  throw new BadRequestException('invalid shop catalog filter parameter');
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
  async purchases(
    @Req() request: RequestWithSession,
    @Query('q') query?: unknown,
    @Query('from') from?: unknown,
    @Query('to') to?: unknown,
    @Query('minAmount') minAmount?: unknown,
  ) {
    return this.guarded(
      () => this.service().myPurchasesWithSummary(requireUserId(request), { query, from, to, minAmount }),
      'purchase history is unavailable',
    );
  }

  @Get('purchases/export')
  @Header('Cache-Control', 'private, no-store')
  @Header('X-Robots-Tag', 'noindex')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
  @ApiOperation({ summary: 'Export up to the latest 100 purchases belonging to the caller' })
  async purchasesExport(@Req() request: RequestWithSession, @Query('q') query?: unknown) {
    return {
      scope: 'recent100' as const,
      purchases: await this.guarded(
        () => this.service().myPurchases(requireUserId(request), { limit: 100, query }),
        'purchase export is unavailable',
      ),
    };
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
  @ApiOperation({ summary: 'The public catalogue; optional q, maxPrice, sort and category' })
  async publicCatalog(
    @Query('q') query?: string,
    @Query('filter') filter1?: unknown,
    @Query('sort') filter2?: unknown,
    @Query('category') filter3?: unknown,
  ) {
    validateShopFilter(filter1);
    validateShopFilter(filter2);
    validateShopFilter(filter3);
    const catalogItems = await this.guarded(
      () => this.repository().catalog(null),
      'the catalogue is unavailable',
    );
    let filtered = filterShopItems(catalogItems, query);
    filtered = applyGenericShopFilter(filtered, filter1);
    filtered = applyGenericShopFilter(filtered, filter2);
    filtered = applyGenericShopFilter(filtered, filter3);
    return { catalogItems: filtered };
  }

  @Get('catalog')
  @UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
  @ApiOperation({ summary: 'The member catalogue; q searches and sort orders exact price asc/desc' })
  async catalog(
    @Req() request: RequestWithSession,
    @Query('q') query?: string,
    @Query('filter') filter1?: unknown,
    @Query('sort') filter2?: unknown,
    @Query('category') filter3?: unknown,
  ) {
    validateShopFilter(filter1);
    validateShopFilter(filter2);
    validateShopFilter(filter3);
    const catalogItems = await this.guarded(
      () => this.repository().catalog(requireUserId(request)),
      'the catalogue is unavailable',
    );
    let filtered = filterShopItems(catalogItems, query);
    filtered = applyGenericShopFilter(filtered, filter1);
    filtered = applyGenericShopFilter(filtered, filter2);
    filtered = applyGenericShopFilter(filtered, filter3);
    return { catalogItems: filtered };
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
    let holdings = await this.guarded(
      () => this.repository().holdings(requireUserId(request)),
      'held items are unavailable',
    );
    if (!Array.isArray(holdings)) {
      throw new ServiceUnavailableException('held items are unavailable');
    }
    if (filter === 'attention') {
      holdings = holdings.filter((item: any) => item.suspended === true || Number(item.unpaid_weeks ?? 0) > 0);
    }
    return { holdings };
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
