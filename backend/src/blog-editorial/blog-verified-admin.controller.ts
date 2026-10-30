import { BadRequestException, Body, Controller, Get, Header, Inject, Param, Post, Req, UseGuards } from '@nestjs/common';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { requireUserId, type RequestWithSession } from '../auth/session.context';
import { BlogVerifiedRepository } from './blog-verified.repository';
import { selectTwoHourBlogSlot } from './blog-two-hour-rotation';

@Controller('admin/blog-verified')
@UseGuards(SessionGuard,AuthenticatedGuard,ConsentGuard,AdminGuard,AdminSessionGuard)
export class BlogVerifiedAdminController {
  constructor(@Inject(BlogVerifiedRepository) private readonly repo:BlogVerifiedRepository) {}
  @Get()
  @Header('Cache-Control', 'private, no-store')
  @Header('X-Robots-Tag', 'noindex')
  async list(@Req() req: RequestWithSession) {
    return {posts: await this.repo.listForAdmin(requireUserId(req))};
  }

  /** Administrator-only operational truth. No fake model or scheduler readiness. */
  @Get('publisher-status')
  @Header('Cache-Control', 'private, no-store')
  @Header('X-Robots-Tag', 'noindex')
  async publisherStatus() {
    const now = new Date();
    const koreaHour = new Date(now.getTime() + 9 * 60 * 60 * 1000).getUTCHours();
    const nextSlot = selectTwoHourBlogSlot(
      new Date(now.getTime() + (koreaHour % 2 === 0 ? 0 : 60 * 60 * 1000)),
    );
    // A dedicated systemd timer may own blog publishing while the global
    // economy scheduler stays disabled. Both paths still require independent
    // model/source certification; a config flag alone is not proof of success.
    const workerEnabled = process.env.BLOG_VERIFIED_WORKER_ENABLED === 'true';
    const schedulerEnabled = process.env.BLOG_TWO_HOUR_PUBLISHER_ENABLED === 'true'
      && (process.env.MONEYVERSE_SCHEDULER_ENABLED === 'true' || workerEnabled);
    const modelVerified = process.env.BLOG_EDITORIAL_MODEL_VERIFIED === 'true';
    const posts = await this.repo.list();
    return {
      success: true,
      automaticEnabled: schedulerEnabled && modelVerified,
      manualEnabled: false, // No authenticated, rate-limited verified manual job is implemented.
      modelVerified,
      executionMode: workerEnabled ? 'DEDICATED_TIMER' : 'GLOBAL_SCHEDULER',
      verifiedPublishedCount: posts.length,
      nextSlot: nextSlot ? {
        country: nextSlot.country,
        topic: nextSlot.topic,
        periodKey: nextSlot.periodKey,
      } : null,
      reason: !modelVerified ? 'MODEL_VERIFICATION_PENDING'
        : !schedulerEnabled ? 'VERIFIED_SCHEDULER_DISABLED' : 'AUTOMATIC_SCHEDULER_CONFIGURED',
    };
  }

  @Post(':slug/moderate')
  @UseGuards(CsrfGuard)
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
