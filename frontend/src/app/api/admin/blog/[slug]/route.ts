import { NextResponse } from 'next/server';
import { currentViewer, isAdministrator } from '@/lib/viewer';
import { deleteBlogPost } from '@/app/blog/blog-data';
import { verifiedArticleBySlug } from '@/app/blog/blog-verified-client';
import { mutate } from '@/lib/mutate';

export const dynamic = 'force-dynamic';

const headers = { 'Cache-Control': 'no-store' } as const;

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const viewer = await currentViewer();
  if (!isAdministrator(viewer)) {
    return NextResponse.json(
      { success: false, code: 'FORBIDDEN', message: 'Administrator required' },
      { status: 403, headers },
    );
  }

  const { slug } = await params;
  if (!slug) {
    return NextResponse.json(
      { success: false, code: 'INVALID_SLUG', message: 'Slug parameter is required' },
      { status: 400, headers },
    );
  }

  const url = new URL(req.url);
  const purge = url.searchParams.get('purge') === 'true';

  const deleted = deleteBlogPost(slug, purge);
  if (!deleted) {
    // Verified AI publications are DB-owned, unlike withdrawn legacy JSON posts.
    // The same administrator UI may withdraw or delete them without bypassing
    // the backend's fresh CSRF token and administrator-role database check.
    const verified = await verifiedArticleBySlug(slug);
    if (verified) {
      try {
        const result = await mutate('/api/v1/admin/blog-verified/' + encodeURIComponent(slug) + '/moderate', {
          method: 'POST',
          body: { action: purge ? 'DELETE' : 'WITHDRAW', reason: 'Administrator requested article removal' },
        });
        return NextResponse.json(result, { headers });
      } catch {
        return NextResponse.json({ success:false,code:'MODERATION_UNAVAILABLE' }, { status:503, headers });
      }
    }
    return NextResponse.json(
      { success: false, code: 'NOT_FOUND', message: 'Article not found' },
      { status: 404, headers },
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: purge ? 'Article permanently purged from disk.' : 'Article withdrawn (soft-deleted).',
      slug,
      action: purge ? 'PURGED' : 'WITHDRAWN',
    },
    { status: 200, headers },
  );
}

/** Explicit administrator correction for a DB-verified article only. */
export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const viewer = await currentViewer();
  if (!isAdministrator(viewer)) {
    return NextResponse.json({success:false,code:'FORBIDDEN'}, {status:403,headers});
  }
  const {slug}=await params;
  const body:unknown=await req.json().catch(()=>null);
  if (!body || typeof body!=='object' || !/^[a-z0-9-]{10,110}$/.test(slug)) {
    return NextResponse.json({success:false,code:'INVALID_INPUT'}, {status:400,headers});
  }
  const input=body as Record<string,unknown>;
  if (typeof input.title!=='string' || typeof input.excerpt!=='string'
      || typeof input.content!=='string' || typeof input.reason!=='string') {
    return NextResponse.json({success:false,code:'INVALID_REVISION'}, {status:400,headers});
  }
  const old=await verifiedArticleBySlug(slug);
  if (!old) return NextResponse.json({success:false,code:'NOT_FOUND'}, {status:404,headers});
  try {
    const result=await mutate('/api/v1/admin/blog-verified/'+encodeURIComponent(slug)+'/moderate', {
      method:'POST',body:{action:'REVISE',title:input.title,excerpt:input.excerpt,
        content:input.content,reason:input.reason},
    });
    return NextResponse.json(result,{headers});
  }catch {
    return NextResponse.json({success:false,code:'REVISION_UNAVAILABLE'}, {status:503,headers});
  }
}
