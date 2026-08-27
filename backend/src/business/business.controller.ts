import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { isExpectedCommandFailure } from '../core/pg-error';
import { BusinessInputError } from './business.repository';
import { BusinessService } from './business.service';

export class IdempotentDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

@ApiTags('businesses')
@Controller()
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
export class BusinessController {
  constructor(@Inject(BusinessService) private readonly businesses: BusinessService | null) {}

  private service(): BusinessService {
    if (!this.businesses) {
      throw new ServiceUnavailableException('business service is unavailable');
    }
    return this.businesses;
  }

  private async guarded<T>(work: () => Promise<T>, message: string): Promise<T> {
    try {
      return await work();
    } catch (error: unknown) {
      if (error instanceof BusinessInputError) throw new BadRequestException(error.message);
      if (isExpectedCommandFailure(error)) throw new ConflictException(message);
      throw error;
    }
  }

  /**
   * The catalogue of purchasable types, which the original served at
   * /api/v1/businesses. The caller's own holdings took /businesses/mine; those
   * are different resources, so the catalogue moved to its own noun and the
   * holdings took the plain path.
   */
  @Get('business-types')
  @ApiOperation({ summary: 'Business types available to buy' })
  async catalog() {
    return { businessTypes: await this.service().catalog() };
  }

  @Get('businesses')
  @ApiOperation({ summary: 'Businesses the caller owns' })
  async mine(@Req() request: RequestWithSession) {
    return { businesses: await this.service().mine(requireUserId(request)) };
  }

  @Post('business-types/:id/purchases')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Buy a business of this type' })
  purchase(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) businessTypeId: string,
    @Body() body: IdempotentDto,
  ) {
    return this.guarded(
      () =>
        this.service().purchase(requireUserId(request), {
          businessTypeId,
          idempotencyKey: body.idempotencyKey,
        }),
      'this business purchase cannot be completed now',
    );
  }

  @Post('businesses/:id/settlements')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Settle a day of revenue' })
  settle(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) ownershipId: string,
    @Body() body: IdempotentDto,
  ) {
    return this.guarded(
      () =>
        this.service().settle(requireUserId(request), {
          ownershipId,
          idempotencyKey: body.idempotencyKey,
        }),
      'this settlement cannot be completed now',
    );
  }
}
