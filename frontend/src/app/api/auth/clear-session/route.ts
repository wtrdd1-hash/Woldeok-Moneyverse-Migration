import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const COOKIES_TO_CLEAR = [
  'mv_session',
  '__Host-mv_session',
  'moneyverse_session',
  'wdmv_session',
  'session',
  'auth_token',
  'token',
];

export async function POST() {
  const cookieStore = await cookies();
  for (const name of COOKIES_TO_CLEAR) {
    try {
      cookieStore.delete(name);
    } catch {
      /* ignore */
    }
  }

  const response = NextResponse.json({
    success: true,
    ok: true,
    message: '세션 쿠키가 서버단에서 완벽히 소거되었습니다.',
    timestamp: new Date().toISOString(),
  });

  for (const name of COOKIES_TO_CLEAR) {
    response.cookies.set(name, '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      sameSite: 'lax',
    });
    if (name.startsWith('__Host-')) {
      response.cookies.set(name, '', {
        path: '/',
        maxAge: 0,
        expires: new Date(0),
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
      });
    }
  }

  return response;
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  for (const name of COOKIES_TO_CLEAR) {
    try {
      cookieStore.delete(name);
    } catch {
      /* ignore */
    }
  }

  const url = new URL(request.url);
  const redirectTo = url.searchParams.get('redirect') ?? '/';
  const response = NextResponse.redirect(new URL(redirectTo, request.url));

  for (const name of COOKIES_TO_CLEAR) {
    response.cookies.set(name, '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      sameSite: 'lax',
    });
    if (name.startsWith('__Host-')) {
      response.cookies.set(name, '', {
        path: '/',
        maxAge: 0,
        expires: new Date(0),
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
      });
    }
  }

  return response;
}
