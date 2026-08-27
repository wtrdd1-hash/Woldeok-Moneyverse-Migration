import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { requireUserId } from '../auth/session.context';
import { isAuthorizationFailure, pgErrorCode } from '../core/pg-error';
import { BoardInputError, BoardService } from './board.service';

export class CreatePostDto {
  @ApiProperty({ maxLength: 120 })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  readonly title!: string;

  @ApiProperty({ maxLength: 5000 })
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  readonly body!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class DeletePostDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

@ApiTags('board')
@Controller('board/posts')
@UseGuards(SessionGuard, AuthenticatedGuard, ConsentGuard)
export class BoardController {
  constructor(@Inject(BoardService) private readonly board: BoardService | null) {}

  private service(): BoardService {
    if (!this.board) throw new ServiceUnavailableException('board service is unavailable');
    return this.board;
  }

  /**
   * New. The original had no list endpoint because the /board page rendered
   * the posts server-side from EJS; a Next page cannot, so the data needs a
   * route of its own. The guards match what that page required.
   */
  @Get()
  @ApiOperation({ summary: 'Recent member board posts' })
  async list(@Req() request: RequestWithSession) {
    return { posts: await this.service().list(requireUserId(request)) };
  }

  @Post()
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Write a post' })
  async create(@Req() request: RequestWithSession, @Body() body: CreatePostDto) {
    try {
      return { post: await this.service().create(requireUserId(request), { ...body }) };
    } catch (error: unknown) {
      throw this.asClientError(error);
    }
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Delete your own post' })
  async remove(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) postId: string,
    @Body() body: DeletePostDto,
  ): Promise<void> {
    let deleted: boolean;
    try {
      deleted = await this.service().remove(requireUserId(request), postId, body.idempotencyKey);
    } catch (error: unknown) {
      throw this.asClientError(error);
    }
    // The original answered 404 for a post that is not the caller's as well
    // as for one that does not exist, which is what stops the endpoint being
    // used to discover whether a post id is real.
    if (!deleted) throw new NotFoundException('post not found');
  }

  private asClientError(error: unknown): Error {
    if (error instanceof BoardInputError) return new BadRequestException('invalid board request');
    if (isAuthorizationFailure(error) || pgErrorCode(error) === '22023') {
      return new BadRequestException('invalid board request');
    }
    return error instanceof Error ? error : new Error(String(error));
  }
}
