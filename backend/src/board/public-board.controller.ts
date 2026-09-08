import { Controller, Get, Inject, NotFoundException, Param, ParseUUIDPipe, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PublicBoardService } from './public-board.service';

@ApiTags('board')
@Controller('board/public/posts')
export class PublicBoardController {
  constructor(@Inject(PublicBoardService) private readonly board: PublicBoardService | null) {}

  private service(): PublicBoardService {
    if (!this.board) throw new ServiceUnavailableException('public board service is unavailable');
    return this.board;
  }

  @Get()
  @ApiOperation({ summary: 'Public recent board posts' })
  async list() {
    return { posts: await this.service().list() };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Public board post' })
  async read(@Param('id', ParseUUIDPipe) postId: string) {
    const post = await this.service().get(postId);
    if (!post) throw new NotFoundException('post not found');
    return { post };
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Public replies on a board post' })
  async comments(@Param('id', ParseUUIDPipe) postId: string) {
    return { comments: await this.service().comments(postId) };
  }
}
