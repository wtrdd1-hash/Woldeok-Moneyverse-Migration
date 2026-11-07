import {
  BadRequestException,
  Body,
  Controller,
  Get,
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
import { ExecuteCraftingDto } from './crafting.dto';

/**
 * The DEV crafting_execute function writes user_cash_balances directly and
 * does not persist/replay p_key. There is no tracked, approved migration
 * establishing ledger-backed atomic crafting. Never expose the hardcoded
 * catalog as executable or call that function until both are proven safe.
 */
@ApiTags('crafting')
@Controller('crafting')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
export class CraftingController {
  @Get('recipes')
  @ApiOperation({ summary: 'Crafting recipes (unavailable pending verified ledger source)' })
  listRecipes(): never {
    throw new ServiceUnavailableException({
      code: 'CRAFTING_SOURCE_UNVERIFIED',
      message: 'crafting recipe availability is not verified',
    });
  }

  @Post('execute')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Crafting execution (disabled pending atomic ledger settlement)' })
  executeCrafting(@Req() request: RequestWithSession, @Body() body: ExecuteCraftingDto): never {
    requireUserId(request);
    if (!body.recipeId) throw new BadRequestException('recipeId is required');
    throw new ServiceUnavailableException({
      code: 'CRAFTING_LEDGER_UNAVAILABLE',
      message: 'crafting settlement is unavailable',
    });
  }
}
