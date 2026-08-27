import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { EconomyReconciliationInputError } from './reconciliation.repository';
import {
  EconomyReconciliationReadModelError,
  EconomyReconciliationService,
} from './reconciliation.service';

/**
 * Read only, and deliberately so. A separate reconciler writes append-only
 * snapshots under its own role; there is no web-accessible command to take
 * one. Administrators can inspect the latest server-authorized result and
 * nothing more — adding a "run reconciliation now" endpoint here would put
 * the integrity check under the control of the thing it checks.
 */
@ApiTags('admin')
@Controller('admin/economy/reconciliations')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard)
export class ReconciliationController {
  constructor(
    @Inject(EconomyReconciliationService)
    private readonly reconciliation: EconomyReconciliationService | null,
  ) {}

  @Get('latest')
  @ApiOperation({ summary: 'Most recent economy reconciliation health snapshot' })
  async latest(@Req() request: RequestWithSession) {
    if (!this.reconciliation) {
      throw new ServiceUnavailableException('economy reconciliation health is unavailable');
    }
    try {
      return await this.reconciliation.latestHealth(requireUserId(request));
    } catch (error: unknown) {
      if (error instanceof EconomyReconciliationInputError) {
        throw new BadRequestException('invalid reconciliation request');
      }
      // A malformed row from the read model is not something the caller can
      // act on, and its detail describes internal shape. The original
      // reported it as unavailable.
      if (error instanceof EconomyReconciliationReadModelError) {
        throw new ServiceUnavailableException('economy reconciliation health is unavailable');
      }
      throw error;
    }
  }
}
