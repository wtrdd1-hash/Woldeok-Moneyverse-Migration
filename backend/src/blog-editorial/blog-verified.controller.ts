import { Controller, Get, Inject, Param } from '@nestjs/common';
import { SkipInternalToken } from '../auth/guards/skip-internal-token.decorator';
import { BlogVerifiedRepository } from './blog-verified.repository';

@Controller('blog')
export class BlogVerifiedPublicController {
  constructor(@Inject(BlogVerifiedRepository) private readonly repository:BlogVerifiedRepository) {}

  @Get('verified')
  @SkipInternalToken()
  async list() {
    const posts = await this.repository.list();
    return { success:true, count:posts.length, posts };
  }

  @Get('verified/:slug')
  @SkipInternalToken()
  async bySlug(@Param('slug') slug:string) {
    if (!/^[a-z0-9-]{10,110}$/.test(slug)) return {success:false,post:null};
    const post = await this.repository.find(slug);
    return { success:!!post, post };
  }
}
