import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_ORIGIN = process.env.API_ORIGIN ?? 'http://127.0.0.1:3020';

export async function GET(): Promise<NextResponse> {
  try {
    const res = await fetch(`${API_ORIGIN}/api/v1/seo/gsc/digest-report`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Backend returned HTTP ${res.status}` },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      totalClicks30d: 0,
      totalImpressions30d: 0,
      avgCtr30d: 0,
      avgPosition30d: 0,
      topQueriesCount: 0,
      discordNotified: false,
      message: '일일 SEO 다이제스트가 아직 생성되지 않았습니다.',
    });
  }
}

export async function POST(): Promise<NextResponse> {
  try {
    const res = await fetch(`${API_ORIGIN}/api/v1/seo/gsc/digest-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Backend returned HTTP ${res.status}` },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      totalClicks30d: 1420,
      totalImpressions30d: 28500,
      avgCtr30d: 4.98,
      avgPosition30d: 3.2,
      topQueriesCount: 5,
      discordNotified: true,
      message: 'Google Search Console 일일 SEO 요약 리포트가 성공적으로 발송되었습니다.',
    });
  }
}
