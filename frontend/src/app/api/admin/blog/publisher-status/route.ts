import { NextResponse } from 'next/server';
import { currentViewer, isAdministrator } from '@/lib/viewer';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control':'private, no-store', 'X-Robots-Tag':'noindex, nofollow' } as const;

export async function GET() {
  if (!isAdministrator(await currentViewer())) {
    return NextResponse.json({success:false, code:'FORBIDDEN'}, {status:403,headers});
  }
  try {
    const status = await api<{success:boolean}>('/api/v1/admin/blog-verified/publisher-status', {timeoutMs:5000});
    if (!status.success) throw new Error('INVALID_PUBLISHER_STATUS');
    return NextResponse.json(status, {headers});
  } catch {
    return NextResponse.json({
      success:false, code:'PUBLISHER_STATUS_UNAVAILABLE',
      message:'Verified publisher health has not been established',
    }, {status:503,headers});
  }
}
