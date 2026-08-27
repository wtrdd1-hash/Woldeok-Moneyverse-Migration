import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
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
import { isExpectedCommandFailure } from '../core/pg-error';
import { PurchaseDto } from './shop.dto';
import { ShopInputError } from './shop.repository';
import { ShopItemUnavailableError, ShopService } from './shop.service';

@ApiTags('shop')
@Controller('shop')
export class ShopController {
  constructor(@Inject(ShopService) private readonly shop: ShopService | null) {}

  private service(): ShopService {
    if (!this.shop) throw new ServiceUnavailableException('shop service is unavailable');
    return this.shop;
  }

  /**
   * Deliberately unguarded: the catalogue is public in the original, and a
   * visitor deciding whether to join can see what the shop sells. Only the
   * purchase paths below carry a session.
   */
  @Get('items')
  @ApiOperation({ summary: 'Items currently on sale' })
  async items() {
    return { items: await this.service().catalog() };
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
}
