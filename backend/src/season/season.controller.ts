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
import { IsInt, IsPositive, IsUUID } from 'class-validator';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { isExpectedCommandFailure } from '../core/pg-error';
import { SeasonInputError } from './season.repository';
import { SeasonService } from './season.service';

export class ConsumeDto {
  @ApiProperty({ type: Number, minimum: 1 })
  @IsInt()
  @IsPositive()
  readonly quantity!: number;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

@ApiTags('seasons')
@Controller('seasons')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
export class SeasonController {
  constructor(@Inject(SeasonService) private readonly seasons: SeasonService | null) {}

  private service(): SeasonService {
    if (!this.seasons) throw new ServiceUnavailableException('season service is unavailable');
    return this.seasons;
  }

  @Get('events')
  @ApiOperation({ summary: 'Active season events' })
  async events() {
    return { events: await this.service().events() };
  }

  @Get('events/:id/leaderboard')
  @ApiOperation({ summary: 'Leaderboard for one event' })
  async leaderboard(@Param('id', ParseUUIDPipe) eventId: string) {
    return { entries: await this.service().leaderboard(eventId) };
  }

  @Post('events/:id/consumptions')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Spend on a season event' })
  async consume(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) eventId: string,
    @Body() body: ConsumeDto,
  ) {
    try {
      return await this.service().consume(requireUserId(request), {
        eventId,
        quantity: body.quantity,
        idempotencyKey: body.idempotencyKey,
      });
    } catch (error: unknown) {
      if (error instanceof SeasonInputError) throw new BadRequestException(error.message);
      if (isExpectedCommandFailure(error)) {
        throw new ConflictException('this season action cannot be completed now');
      }
      throw error;
    }
  }
}
