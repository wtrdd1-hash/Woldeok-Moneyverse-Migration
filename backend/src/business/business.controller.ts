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
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
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

export class ActivateLicenseDto {
  @ApiProperty({ example: 'biz_cvs_license' })
  @IsString()
  @IsNotEmpty()
  readonly catalogCode!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class ApplyBoostDto {
  @ApiProperty({ example: 'biz_cvs_boost_7d' })
  @IsString()
  @IsNotEmpty()
  readonly boostCode!: string;
}

@ApiTags('businesses')
@Controller()
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
export class BusinessController {
  constructor(@Inject(BusinessService) private readonly businesses: BusinessService | null) {}

  private service(): BusinessService {
    if (!this.businesses) throw new ServiceUnavailableException('business service is unavailable');
    return this.businesses;
  }

  private async guarded<T>(work: () => Promise<T>, message: string): Promise<T> {
    try {
      return await work();
    } catch (error: unknown) {
      if (error instanceof BusinessInputError) throw new BadRequestException(error.message);
      if (isExpectedCommandFailure(error)) {
        const msg = error instanceof Error && error.message ? error.message : message;
        throw new ConflictException(msg);
      }
      throw error;
    }
  }

  @Get('business-types')
  @ApiOperation({ summary: 'Business types available to buy' })
  async catalog() {
    return { businessTypes: await this.service().catalog() };
  }

  @Get('businesses/catalog')
  @ApiOperation({ summary: 'App API alias: business types available to buy' })
  catalogForApp() {
    return this.catalog();
  }

  @Get('businesses')
  @ApiOperation({ summary: 'Businesses the caller owns' })
  async mine(@Req() request: RequestWithSession) {
    return { businesses: await this.service().mine(requireUserId(request)) };
  }

  @Get('businesses/my-v2')
  @ApiOperation({ summary: 'Enhanced businesses the caller owns with boosts and settlement status' })
  async mineV2(@Req() request: RequestWithSession) {
    return { businesses: await this.service().mineV2(requireUserId(request)) };
  }

  @Get('business-equity')
  @ApiOperation({ summary: 'The own capital the caller can put behind a purchase' })
  async equity(@Req() request: RequestWithSession) {
    return { equity: await this.service().equity(requireUserId(request)) };
  }

  @Get('businesses/equity')
  @ApiOperation({ summary: 'App API alias: own capital available for a business purchase' })
  equityForApp(@Req() request: RequestWithSession) {
    return this.equity(request);
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
      () => this.service().purchase(requireUserId(request), { businessTypeId, idempotencyKey: body.idempotencyKey }),
      'this business purchase cannot be completed now',
    );
  }

  @Post('businesses/catalog/:id/purchases')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'App API alias: buy a business from the catalogue' })
  purchaseForApp(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) businessTypeId: string,
    @Body() body: IdempotentDto,
  ) {
    return this.purchase(request, businessTypeId, body);
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
      () => this.service().settle(requireUserId(request), { ownershipId, idempotencyKey: body.idempotencyKey }),
      'this settlement cannot be completed now',
    );
  }

  @Post('businesses/:id/settle-v2')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Settle a day of revenue with active boosts and double-entry ledger sink' })
  settleV2(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) ownershipId: string,
    @Body() body: IdempotentDto,
  ) {
    return this.guarded(
      () => this.service().settleV2(requireUserId(request), { ownershipId, idempotencyKey: body.idempotencyKey }),
      'this settlement cannot be completed now',
    );
  }

  @Post('businesses/activate-license')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Activate a business using a purchased license item from inventory' })
  activateLicense(@Req() request: RequestWithSession, @Body() body: ActivateLicenseDto) {
    return this.guarded(
      () => this.service().activateFromLicense(requireUserId(request), { catalogCode: body.catalogCode, idempotencyKey: body.idempotencyKey }),
      'failed to activate business license',
    );
  }

  @Post('businesses/:id/boost')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Equip a boost item from inventory to business' })
  applyBoost(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) ownershipId: string,
    @Body() body: ApplyBoostDto,
  ) {
    return this.guarded(
      () => this.service().applyBoost(requireUserId(request), { ownershipId, boostCode: body.boostCode }),
      'failed to apply boost item',
    );
  }
}
