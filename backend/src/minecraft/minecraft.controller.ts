import {
  BadRequestException,
  Body,
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
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsIn, IsUUID } from 'class-validator';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { isExpectedCommandFailure } from '../core/pg-error';
import {
  MINECRAFT_APPROVED_OPERATIONS,
  MinecraftApprovedOperationInputError,
} from './approved-operation.repository';
import { MinecraftApprovedOperationService } from './approved-operation.service';

export class RequestOperationDto {
  @ApiProperty({ enum: MINECRAFT_APPROVED_OPERATIONS })
  @IsIn(MINECRAFT_APPROVED_OPERATIONS as string[])
  readonly operation!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

/**
 * Requesting a host operation, and reading back the one you requested.
 *
 * This process never runs a Minecraft command. A request recorded here waits
 * for two-person approval and is then claimed, under a database lease, by the
 * separate host-local executor. There is deliberately no endpoint that
 * executes, approves or cancels: approval goes through the admin approval
 * queue, and execution belongs to a worker that does not accept HTTP.
 */
@ApiTags('minecraft')
@Controller('admin/minecraft/operations')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard, AdminGuard)
export class MinecraftController {
  constructor(
    @Inject(MinecraftApprovedOperationService)
    private readonly operations: MinecraftApprovedOperationService | null,
  ) {}

  private service(): MinecraftApprovedOperationService {
    if (!this.operations) {
      throw new ServiceUnavailableException('minecraft operation service is unavailable');
    }
    return this.operations;
  }

  @Post()
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Request an approved host operation' })
  async request(@Req() request: RequestWithSession, @Body() body: RequestOperationDto) {
    try {
      return await this.service().requestOperation(requireUserId(request), { ...body });
    } catch (error: unknown) {
      if (error instanceof MinecraftApprovedOperationInputError) {
        throw new BadRequestException(error.message);
      }
      if (isExpectedCommandFailure(error)) {
        throw new BadRequestException('invalid operation request');
      }
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Read back an operation you requested' })
  async myOperation(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) operationId: string,
  ) {
    const operation = await this.service().myOperation(requireUserId(request), { operationId });
    // The function returns nothing for an operation belonging to somebody
    // else as well as for one that does not exist, so this cannot be used to
    // discover whether an id is real.
    if (!operation) throw new NotFoundException('operation not found');
    return operation;
  }
}
