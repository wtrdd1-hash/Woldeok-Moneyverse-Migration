import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const API_ORIGIN = process.env.API_ORIGIN ?? 'http://127.0.0.1:3020';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join('; ');

    const res = await fetch(`${API_ORIGIN}/api/v1/admin/treasury/swf`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join('; ');

    const res = await fetch(`${API_ORIGIN}/api/v1/admin/treasury/swf/rebalance`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: cookieHeader,
      },
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 },
    );
  }
}
