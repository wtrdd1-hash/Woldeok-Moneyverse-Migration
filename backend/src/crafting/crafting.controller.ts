import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Req,
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
import { ExecuteCraftingDto } from './crafting.dto';
import { CraftingService } from './crafting.service';

@ApiTags('crafting')
@Controller('crafting')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
export class CraftingController {
  constructor(private readonly craftingService: CraftingService) {}

  private async guarded<T>(work: () => Promise<T>, conflictMessage: string): Promise<T> {
    try {
      return await work();
    } catch (error: unknown) {
      if (isAuthorizationFailure(error)) throw new ForbiddenException('this is not yours');
      if (isExpectedCommandFailure(error)) {
        const msg = error instanceof Error && error.message ? error.message : conflictMessage;
        throw new ConflictException(msg);
      }
      throw error;
    }
  }

  @Get('recipes')
  @ApiOperation({ summary: 'List all official crafting recipes with required materials and fees' })
  listRecipes() {
    return this.craftingService.listRecipes();
  }

  @Post('execute')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Execute crafting recipe: consume materials and WLD fee to mint crafted item' })
  executeCrafting(@Req() request: RequestWithSession, @Body() body: ExecuteCraftingDto) {
    if (!body.recipeId) throw new BadRequestException('recipeId is required');
    return this.guarded(
      () =>
        this.craftingService.executeCrafting(
          requireUserId(request),
          body.recipeId,
          body.idempotencyKey,
        ),
      'failed to execute crafting',
    );
  }
}
