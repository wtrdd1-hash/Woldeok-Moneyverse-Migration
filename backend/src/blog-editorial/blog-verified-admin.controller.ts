import { BadRequestException, Body, Controller, Inject, Param, Post, Req, UseGuards } from '@nestjs/common';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { requireUserId, type RequestWithSession } from '../auth/session.context';
import { BlogVerifiedRepository } from './blog-verified.repository';

@Controller('admin/blog-verified')
@UseGuards(SessionGuard,AuthenticatedGuard,ConsentGuard,AdminGuard,AdminSessionGuard,CsrfGuard)
export class BlogVerifiedAdminController {
  constructor(@Inject(BlogVerifiedRepository) private readonly repo:BlogVerifiedRepository) {}
  @Post(':slug/moderate')
  async moderate(@Req() req:RequestWithSession, @Param('slug') slug:string, @Body() body:unknown) {
    const input = body && typeof body==='object' ? body as Record<string,unknown> : {};
    const action = input.action;
    const reason = input.reason;
    if (!/^[a-z0-9-]{10,110}$/.test(slug)
      || !['WITHDRAW','DELETE','REVISE'].includes(String(action))
      || typeof reason!=='string' || reason.trim().length<3 || reason.length>2000) {
      throw new BadRequestException('invalid blog moderation');
    }
    const revised = action === 'REVISE';
    if (revised && [input.title,input.excerpt,input.content].some(x => typeof x !== 'string'))
      throw new BadRequestException('revision requires title excerpt and content');
    const result = await this.repo.moderate({
      actor:requireUserId(req), slug, action:String(action), reason,
      ...(revised ? {
        title: input.title as string, excerpt: input.excerpt as string,
        content: input.content as string,
      } : {}),
    });
    return {success:true, receipt:result?.publication_receipt, status:result?.result_status};
  }
}
