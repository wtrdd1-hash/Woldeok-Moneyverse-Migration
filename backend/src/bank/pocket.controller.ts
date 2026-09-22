import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
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
import { BankInputError, BankRepository } from './bank.repository';
import {
  ArchivePocketDto,
  CreatePocketDto,
  CustomizePocketDto,
  TransferPocketDto,
} from './pocket.dto';

@ApiTags('banking')
@Controller('banking/pockets')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
export class PocketController {
  constructor(@Inject(BankRepository) private readonly bank: BankRepository | null) {}

  private repository(): BankRepository {
    if (!this.bank) throw new ServiceUnavailableException('bank service is unavailable');
    return this.bank;
  }

  private async guarded<T>(work: () => Promise<T>, conflictMessage: string): Promise<T> {
    try {
      return await work();
    } catch (error: unknown) {
      if (error instanceof BankInputError) throw new BadRequestException(error.message);
      if (isAuthorizationFailure(error)) throw new ForbiddenException('this is not yours');
      if (isExpectedCommandFailure(error)) {
        const msg = error instanceof Error && error.message ? error.message : conflictMessage;
        throw new ConflictException(msg);
      }
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'List all saving pockets for current user' })
  listPockets(@Req() request: RequestWithSession) {
    return this.guarded(
      () => this.repository().listPockets(requireUserId(request)),
      'failed to load saving pockets',
    );
  }

  @Post()
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Create a new saving pocket' })
  createPocket(@Req() request: RequestWithSession, @Body() body: CreatePocketDto) {
    return this.guarded(
      () =>
        this.repository().createPocket(
          requireUserId(request),
          body.name,
          body.targetAmount,
          body.targetDate,
          body.themeColor,
          body.iconCode,
        ),
      'failed to create saving pocket',
    );
  }

  @Post(':id/transfer')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Transfer funds between main bank balance and saving pocket' })
  transferPocket(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) pocketId: string,
    @Body() body: TransferPocketDto,
  ) {
    return this.guarded(
      () =>
        this.repository().transferPocket(
          body.idempotencyKey,
          requireUserId(request),
          pocketId,
          body.direction,
          body.amount,
        ),
      'failed to transfer pocket funds',
    );
  }

  @Put(':id')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Customize saving pocket appearance and theme' })
  customizePocket(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) pocketId: string,
    @Body() body: CustomizePocketDto,
  ) {
    return this.guarded(
      () =>
        this.repository().customizePocket(
          '00000000-0000-0000-0000-000000000000',
          requireUserId(request),
          pocketId,
          body.themeColor,
          body.iconCode,
        ),
      'failed to customize saving pocket',
    );
  }

  @Post(':id/archive')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Archive saving pocket and recover all funds to cash balance' })
  archivePocket(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) pocketId: string,
    @Body() body: ArchivePocketDto,
  ) {
    return this.guarded(
      () =>
        this.repository().archivePocket(
          body.idempotencyKey,
          requireUserId(request),
          pocketId,
        ),
      'failed to archive saving pocket',
    );
  }
}
