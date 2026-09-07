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
  Put,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';
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

  @ApiProperty({ required: false, pattern: '^[0-9a-f-]{36}\\.(png|jpg|webp)$' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9a-f-]{36}\.(png|jpg|webp)$/)
  readonly imageStorageKey?: string;

  @ApiProperty({ required: false, maxLength: 300 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  readonly imageAltText?: string;
}

/** Same fields as writing one: an edit replaces the post, it does not patch it. */
export class UpdatePostDto extends CreatePostDto {}

export class DeletePostDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class CreateCommentDto {
  @ApiProperty({ maxLength: 1000 })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  readonly body!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  readonly idempotencyKey!: string;
}

export class DeleteCommentDto {
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
   *
   * Summaries only — a title, an author, a date and a reply count. The body
   * belongs to the post's own route, which is what stops a list of fifty
   * posts carrying a quarter of a megabyte of text nothing renders.
   */
  @Get()
  @ApiOperation({ summary: 'Recent member board posts' })
  async list(@Req() request: RequestWithSession) {
    return { posts: await this.service().list(requireUserId(request)) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'One post, with its body' })
  async read(@Req() request: RequestWithSession, @Param('id', ParseUUIDPipe) postId: string) {
    const post = await this.service().get(requireUserId(request), postId);
    if (!post) throw new NotFoundException('post not found');
    return { post };
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

  /**
   * PUT, not PATCH: the body carries the whole post and replaces it, so
   * repeating the request leaves the same post behind.
   */
  @Put(':id')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Rewrite your own post' })
  async update(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) postId: string,
    @Body() body: UpdatePostDto,
  ) {
    let post;
    try {
      post = await this.service().update(requireUserId(request), postId, { ...body });
    } catch (error: unknown) {
      throw this.asClientError(error);
    }
    // 404 for a post that is not the caller's as well as for one that does
    // not exist, the rule the original set for delete: answering 403 for the
    // first would confirm that the id is real.
    if (!post) throw new NotFoundException('post not found');
    return { post };
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

  @Get(':id/comments')
  @ApiOperation({ summary: 'The replies on a post, oldest first' })
  async comments(@Req() request: RequestWithSession, @Param('id', ParseUUIDPipe) postId: string) {
    return { comments: await this.service().listComments(requireUserId(request), postId) };
  }

  @Post(':id/comments')
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Reply to a post' })
  async reply(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) postId: string,
    @Body() body: CreateCommentDto,
  ) {
    try {
      return {
        comment: await this.service().createComment(requireUserId(request), postId, { ...body }),
      };
    } catch (error: unknown) {
      throw this.asClientError(error);
    }
  }

  @Delete(':id/comments/:commentId')
  @HttpCode(204)
  @UseGuards(CsrfGuard)
  @ApiOperation({ summary: 'Delete your own reply' })
  async removeComment(
    @Req() request: RequestWithSession,
    @Param('id', ParseUUIDPipe) _postId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() body: DeleteCommentDto,
  ): Promise<void> {
    let deleted: boolean;
    try {
      deleted = await this.service().removeComment(
        requireUserId(request),
        commentId,
        body.idempotencyKey,
      );
    } catch (error: unknown) {
      throw this.asClientError(error);
    }
    if (!deleted) throw new NotFoundException('comment not found');
  }

  private asClientError(error: unknown): Error {
    if (error instanceof BoardInputError) return new BadRequestException('invalid board request');
    if (isAuthorizationFailure(error) || pgErrorCode(error) === '22023') {
      return new BadRequestException('invalid board request');
    }
    return error instanceof Error ? error : new Error(String(error));
  }
}
