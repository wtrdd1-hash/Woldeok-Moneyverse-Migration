import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function reply(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'private, no-store' },
  });
}

/**
 * The browser never calls NestJS directly. Keep the privileged mutation behind
 * the Next server boundary and let NestJS enforce admin role, console session,
 * CSRF and recent reauthentication. Stock is not writable here or in NestJS
 * until shop_inventory and catalog stock have a verified atomic contract.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const origin = request.headers.get('origin');
  const site = request.headers.get('sec-fetch-site');
  if (!origin || origin !== new URL(request.url).origin || (site && site !== 'same-origin')) {
    return reply({ code: 'CROSS_ORIGIN_FORBIDDEN' }, 403);
  }

  const { id } = await params;
  if (!UUID.test(id)) return reply({ code: 'INVALID_ITEM_ID' }, 400);

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return reply({ code: 'INVALID_REQUEST' }, 400);
  }

  const fields = body as Record<string, unknown>;
  if (Object.hasOwn(fields, 'current_stock')) {
    return reply({ code: 'SHOP_STOCK_AUTHORITY_UNVERIFIED' }, 503);
  }
  if (Object.keys(fields).some((field) => !['base_price', 'active'].includes(field))
    || !Object.hasOwn(fields, 'base_price') || !Object.hasOwn(fields, 'active')
    || !['string', 'number'].includes(typeof fields.base_price)
    || !/^[1-9]\d*$/.test(String(fields.base_price))
    || typeof fields.active !== 'boolean') {
    return reply({ code: 'INVALID_REQUEST' }, 400);
  }

  try {
    const session = await api<{ csrfToken?: string }>('/api/v1/auth/session');
    if (!session.csrfToken) return reply({ code: 'CSRF_UNAVAILABLE' }, 403);

    const data = await api(`/api/v1/admin/shop/items/${id}`, {
      method: 'PATCH',
      body: { base_price: String(fields.base_price), active: fields.active },
      csrfToken: session.csrfToken,
    });
    return reply(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return reply({ code: 'UPSTREAM_REJECTED', error: error.detail ?? error.message }, error.status);
    }
    return reply({ code: 'ADMIN_SHOP_UNAVAILABLE' }, 503);
  }
}
