import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { viewerOrUnknown } from '@/lib/viewer';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' };

export async function POST(req: Request): Promise<NextResponse> {
  const viewer = await viewerOrUnknown();
  if (!viewer) return NextResponse.json({ error: 'Authentication unavailable' }, { status: 503, headers });
  if (!viewer.signedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
  const body = await req.json().catch(() => null) as { question?: unknown } | null;
  const question = typeof body?.question === 'string' ? body.question.trim() : '';
  if (!question || question.length > 1000) {
    return NextResponse.json({ error: 'Question must be between 1 and 1000 characters' }, { status: 400, headers });
  }
  try {
    const result = await api<{ success: boolean; answer?: string }>('/api/v1/advisor/deoki/ask', { method: 'POST', body: { question } });
    if (!result.success || typeof result.answer !== 'string' || !result.answer.trim()) throw new Error('Unverified answer');
    return NextResponse.json(result, { headers });
  } catch {
    return NextResponse.json({ error: 'Verified consultation is currently unavailable' }, { status: 503, headers });
  }
}
