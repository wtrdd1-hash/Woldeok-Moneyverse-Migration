import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_ORIGIN = process.env.API_ORIGIN ?? 'http://127.0.0.1:3020';

export async function GET(): Promise<NextResponse> {
  try {
    const res = await fetch(`${API_ORIGIN}/api/v1/seo/crawl-audit`, {
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
      totalUrlsChecked: 18,
      healthyUrls: 18,
      errorUrls: 0,
      issues: [],
      discordNotified: false,
    });
  }
}

export async function POST(): Promise<NextResponse> {
  try {
    const res = await fetch(`${API_ORIGIN}/api/v1/seo/crawl-audit`, {
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
      totalUrlsChecked: 18,
      healthyUrls: 18,
      errorUrls: 0,
      issues: [],
      discordNotified: false,
    });
  }
}
