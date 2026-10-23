import { NextResponse } from 'next/server';
import { verifySeoOperator, verifySeoWriteOrigin } from '@/lib/admin-seo-authority';
import { currentViewer, isAdministrator } from '@/lib/viewer';
import { deleteBlogPost } from '@/app/blog/blog-data';

export const dynamic = 'force-dynamic';

const headers = { 'Cache-Control': 'no-store' } as const;

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const wrongOrigin = verifySeoWriteOrigin(req);
  if (wrongOrigin) return wrongOrigin;

  const viewer = await currentViewer();
  if (!isAdministrator(viewer)) {
    return NextResponse.json(
      { success: false, code: 'FORBIDDEN', message: 'Administrator required' },
      { status: 403, headers },
    );
  }

  const denied = await verifySeoOperator();
  if (denied) return denied;

  const { slug } = await params;
  if (!slug) {
    return NextResponse.json(
      { success: false, code: 'INVALID_SLUG', message: 'Slug parameter is required' },
      { status: 400, headers },
    );
  }

  const url = new URL(req.url);
  const purge = url.searchParams.get('purge') === 'true';
  // A confirmation dialog alone is bypassable by direct API calls.
  if (purge && req.headers.get('x-blog-purge-confirmation') !== slug) {
    return NextResponse.json(
      { success: false, code: 'PURGE_CONFIRMATION_REQUIRED', message: 'Confirm the exact article slug before permanent deletion' },
      { status: 428, headers },
    );
  }

  const deleted = deleteBlogPost(slug, purge);
  if (!deleted) {
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
