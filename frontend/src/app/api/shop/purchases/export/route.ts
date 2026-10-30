import { api } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { parseShopPurchaseExport, shopPurchaseCsv } from '@/lib/shop-purchase-export';

export const dynamic = 'force-dynamic';

const PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Content-Type-Options': 'nosniff',
};

export async function GET(request: Request): Promise<Response> {
  await requireMember();
  const queries = new URL(request.url).searchParams.getAll('q');
  const term = queries[0]?.trim() ?? '';
  if (queries.length > 1 || Array.from(term).length > 80 || /[\u0000-\u001f\u007f]/.test(term)) {
    return new Response('Invalid purchase search', {
      status: 400,
      headers: { ...PRIVATE_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
  try {
    const path = `/api/v1/shop/purchases/export${term ? `?q=${encodeURIComponent(term)}` : ''}`;
    const verified = parseShopPurchaseExport(await api<unknown>(path));
    if (!verified) throw new Error('unverified purchase export');
    return new Response(shopPurchaseCsv(verified), {
      status: 200,
      headers: {
        ...PRIVATE_HEADERS,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="moneyverse-shop-purchases-recent.csv"',
      },
    });
  } catch {
    return new Response('Purchase export unavailable', {
      status: 503,
      headers: { ...PRIVATE_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
