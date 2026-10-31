import type { NextRequest } from 'next/server';
import { parseVipChestStatus } from '@/app/quests/vip-chest-status';
import { parseSupportSummary } from '@/lib/support-summary';
import { parseShopPurchaseHistory } from '@/lib/shop-purchase-history';
import { parseShopPurchaseExport } from '@/lib/shop-purchase-export';
import { parseSecurityEvents } from '@/app/account/security/account-security-evidence';
import { parseSecurityEventCategory, securityEventsMatchCategory } from '@/lib/security-event-category';
import { activityCalendarRange, type ActivityCalendarRange } from '@/app/wallet/activity/period';
import { verifiedWalletCalendarPage } from '@/lib/wallet-calendar-proof';
import { parseWalletTransactionDetail } from '@/lib/wallet-transaction-detail';
import { isVerifiedAvailableWorkBoard } from '@/lib/work-daily-availability';
import { NextResponse } from 'next/server';
import {
  APP_API_REQUEST_HEADERS,
  APP_API_RESPONSE_HEADERS,
  addAppJsonCompatibility,
  appApiContract,
  appendAppContractHeaders,
  appGatewayOrigin,
  appGatewayPath,
  isJsonMediaType,
} from '@/lib/app-gateway';

const API_ORIGIN = process.env.API_ORIGIN ?? 'http://127.0.0.1:3020';
const METHODS_WITH_BODY = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const ANDROID_ONLY = process.env.APP_API_ANDROID_ONLY === 'true';

function isWalletDetailPath(parts: readonly string[]): boolean {
  return parts.length === 4 && parts[0] === 'wallet' && parts[1] === 'activity' &&
    parts[2] === 'transactions';
}

function isVerifiedOldestSupportThreads(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const rows = (payload as { threads?: unknown }).threads;
  if (!Array.isArray(rows) || rows.length > 50) return false;
  let previousTime = -Infinity;
  const ids = new Set<string>();
  for (const row of rows) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
    const item = row as Record<string, unknown>;
    if (typeof item.thread_id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.thread_id) || ids.has(item.thread_id)) return false;
    if (typeof item.subject !== 'string' || item.subject.length > 120 ||
        !['open', 'waiting_user', 'resolved'].includes(String(item.status))) return false;
    if (typeof item.last_message_at !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(item.last_message_at)) return false;
    const time = Date.parse(item.last_message_at);
    // PostgreSQL Date serialization may lose sub-millisecond ordering.
    if (!Number.isFinite(time) || time < previousTime) return false;
    previousTime = time;
    ids.add(item.thread_id);
  }
  return true;
}

function isVipChestPath(parts: readonly string[]): boolean {
  return parts[0] === 'engagement' && parts[1] === 'dopamine' && parts[2] === 'vip-chest';
}

function parseAppVersion(value: string | null): [number, number, number] | null {
  const match = value?.trim().match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function isVersionBelow(current: [number, number, number], minimum: [number, number, number]): boolean {
  for (let i = 0; i < 3; i += 1) {
    if (current[i]! !== minimum[i]!) return current[i]! < minimum[i]!;
  }
  return false;
}

function looksLikeOfficialAndroid(request: NextRequest): boolean {
  const client = request.headers.get('x-moneyverse-client')?.toLowerCase();
  const userAgent = request.headers.get('user-agent') ?? '';
  return client === 'android' && /^WoldeokMoneyverse-Android\/[0-9]+\.[0-9]+\.[0-9]+(?:\s|$)/.test(userAgent);
}

function internalToken(): string {
  const token = process.env.INTERNAL_API_TOKEN;
  if (!token) throw new Error('INTERNAL_API_TOKEN is not configured');
  return token;
}

function contractJson(payload: unknown, init: ResponseInit = {}): NextResponse {
  const headers = appendAppContractHeaders(new Headers(init.headers));
  return NextResponse.json(payload, { ...init, headers });
}

function gatewayProblem(status: number, title: string, code: string, detail: string): NextResponse {
  return contractJson(
    { type: 'about:blank', title, status, code, detail },
    { status, headers: { 'content-type': 'application/problem+json', 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex' } },
  );
}

async function proxy(request: NextRequest, parts: readonly string[]): Promise<NextResponse> {
  if (parts.length === 2 && parts[0] === 'meta' && parts[1] === 'contract') {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return gatewayProblem(405, 'Method Not Allowed', 'app_gateway_method_not_allowed', 'contract metadata is read-only');
    }
    const origin = appGatewayOrigin(request.headers);
    if (!origin) return gatewayProblem(400, 'Bad Request', 'app_gateway_origin', 'public origin is unavailable');
    const response = contractJson(appApiContract(origin), { status: 200, headers: { 'cache-control': 'public, max-age=300' } });
    return request.method === 'HEAD' ? new NextResponse(null, { status: response.status, headers: response.headers }) : response;
  }

  const path = appGatewayPath(parts);
  if (!path) return gatewayProblem(404, 'Not Found', 'app_gateway_path', 'this path is not part of the public app API');

  const securityEventPath = parts.length === 3 && parts[0] === 'account' && parts[1] === 'security' && parts[2] === 'events';
  const categoryValues = securityEventPath ? request.nextUrl.searchParams.getAll('category') : [];
  const securityCategory = securityEventPath
    ? parseSecurityEventCategory(categoryValues.length > 1 ? categoryValues : categoryValues[0])
    : 'all';
  if (securityEventPath && securityCategory === null) {
    return gatewayProblem(400, 'Bad Request', 'invalid_security_category', 'security event category must be all, login or settings');
  }

  const walletRangeRequest = request.method === 'GET' && parts.length === 2 && parts[0] === 'wallet' && parts[1] === 'activity' &&
    (request.nextUrl.searchParams.has('from') || request.nextUrl.searchParams.has('to'));
  let walletRange: ActivityCalendarRange | null = null;
  if (walletRangeRequest) {
    const query = request.nextUrl.searchParams;
    if (query.getAll('from').length !== 1 || query.getAll('to').length !== 1 ||
        query.getAll('period').length > 1 || query.getAll('direction').length > 1 ||
        (query.has('period') && query.get('period') !== 'all') ||
        (query.has('direction') && !['all', 'in', 'out', 'neutral'].includes(query.get('direction')!))) {
      return gatewayProblem(400, 'Bad Request', 'wallet_range_invalid', 'invalid calendar range filters');
    }
    try { walletRange = activityCalendarRange(query.get('from'), query.get('to')); }
    catch { return gatewayProblem(400, 'Bad Request', 'wallet_range_invalid', 'invalid calendar range filters'); }
  }

  const minimumVersionRaw = process.env.APP_API_MIN_VERSION?.trim();
  if (minimumVersionRaw) {
    const minimumVersion = parseAppVersion(minimumVersionRaw);
    if (!minimumVersion) {
      return gatewayProblem(503, 'Service Unavailable', 'app_gateway_version_policy_invalid', 'the app compatibility policy is unavailable');
    }
    const currentVersion = parseAppVersion(request.headers.get('x-moneyverse-app-version'));
    if (!currentVersion || isVersionBelow(currentVersion, minimumVersion)) {
      const response = gatewayProblem(426, 'Upgrade Required', 'app_upgrade_required', `app version ${minimumVersionRaw} or newer is required`);
      response.headers.set('x-moneyverse-min-app-version', minimumVersionRaw);
      return response;
    }
  }

  // Optional coarse filter for the native public surface only. Normal web
  // /api routes are unaffected. This is intentionally not cryptographic proof;
  // strong Android attestation must use a verified Play Integrity verdict.
  if (ANDROID_ONLY && !looksLikeOfficialAndroid(request)) {
    return gatewayProblem(
      403,
      'Forbidden',
      'android_client_required',
      'this app API is restricted to the Android client',
    );
  }

  if (
    parts.length === 3 &&
    parts[0] === 'auth' &&
    (parts[1] === 'google' || parts[1] === 'discord') &&
    parts[2] === 'authorize' &&
    request.nextUrl.searchParams.get('client') === 'mobile'
  ) {
    const origin = appGatewayOrigin(request.headers);
    if (!origin) return gatewayProblem(400, 'Bad Request', 'app_gateway_origin', 'public origin is unavailable');
    return contractJson({
      authorizationUrl: `${origin}/auth/${encodeURIComponent(parts[1])}/authorize?client=mobile`,
    });
  }

  const workAvailability = parts.length === 2 && parts[0] === 'work' && parts[1] === 'tasks' && request.method === 'GET';
  const availabilityValues = workAvailability ? request.nextUrl.searchParams.getAll('availableOnly') : [];
  if (availabilityValues.length > 1 || (availabilityValues.length === 1 && availabilityValues[0] !== '1')) {
    return gatewayProblem(400, 'Bad Request', 'work_availability_invalid', 'availableOnly must be 1 when provided');
  }

  const receiptAmountFilter =
    parts.length === 2 &&
    parts[0] === 'shop' &&
    parts[1] === 'purchases' &&
    request.method === 'GET';
  const minAmounts = receiptAmountFilter ? request.nextUrl.searchParams.getAll('minAmount') : [];
  if (
    minAmounts.length > 1 ||
    (minAmounts.length === 1 && !/^[1-9][0-9]{0,29}$/.test(minAmounts[0]!))
  ) {
    return gatewayProblem(
      400,
      'Bad Request',
      'shop_receipt_minimum_invalid',
      'minimum WLD must be a canonical positive integer',
    );

  }

  const outgoing = new Headers({
    accept: request.headers.get('accept') ?? 'application/json',
    'x-internal-token': internalToken(),
    'x-moneyverse-gateway': 'app-api-v1',
  });
  for (const name of APP_API_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) outgoing.set(name, value);
  }
  const publicOrigin = appGatewayOrigin(request.headers);
  if (publicOrigin) outgoing.set('x-public-origin', publicOrigin);

  const target = new URL(path, API_ORIGIN);
  target.search = request.nextUrl.search;

  let response: Response;
  try {
    response = await fetch(target, {
      method: request.method,
      headers: outgoing,
      ...(METHODS_WITH_BODY.has(request.method) ? { body: await request.arrayBuffer() } : {}),
      cache: 'no-store',
      redirect: 'manual',
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error: unknown) {
    const name = error instanceof Error ? error.name : '';
    if (name === 'TimeoutError' || name === 'AbortError') {
      return gatewayProblem(504, 'Gateway Timeout', 'app_gateway_timeout', 'the private API did not answer within 15 seconds');
    }
    return gatewayProblem(502, 'Bad Gateway', 'app_gateway_unavailable', 'the private API could not be reached');
  }

  if (isWalletDetailPath(parts) && request.method === 'GET') {
    if (!response.ok) {
      const status = [400, 401, 403, 404, 429].includes(response.status) ? response.status : 503;
      return gatewayProblem(status, 'Wallet Detail Unavailable', 'wallet_detail_unavailable',
        'The owner transaction detail could not be verified');
    }
    try {
      if (!isJsonMediaType(response.headers.get('content-type')) ||
          !parseWalletTransactionDetail(await response.clone().json())) {
        return gatewayProblem(503, 'Service Unavailable', 'wallet_detail_unverified',
          'The owner transaction detail could not be verified');
      }
    } catch {
      return gatewayProblem(503, 'Service Unavailable', 'wallet_detail_unverified',
        'The owner transaction detail could not be verified');
    }
  }

  // A legacy upload backend may echo scanner signatures or filesystem paths.
  // Preserve the HTTP failure class without exposing its untrusted response body.
  if (parts[0] === 'content' && parts[1] === 'chat' && parts[2] === 'upload' && !response.ok) {
    const status = response.status >= 500 ? 503 : response.status;
    return gatewayProblem(status, 'Chat Upload Rejected', 'chat_upload_failed', 'The image upload could not be completed');
  }

  // Older backend images returned HTTP 200 without an actual WLD posting.
  // Do not let a mobile client interpret that legacy response as a receipt.
  if (isVipChestPath(parts)) {
    if (request.method === 'POST' && response.ok) {
      return gatewayProblem(503, 'Service Unavailable', 'vip_chest_unverified', 'VIP reward receipts are unavailable');
    }
    if (parts[3] === 'status' && request.method === 'GET' && response.ok) {
      try {
        if (!parseVipChestStatus(await response.clone().json())) {
          return gatewayProblem(503, 'Service Unavailable', 'vip_chest_unverified', 'VIP entitlement and receipt status are unverified');
        }
      } catch {
        return gatewayProblem(503, 'Service Unavailable', 'vip_chest_unverified', 'VIP status response is invalid');
      }
    }
  }

  // A stale backend can ignore an optional order parameter while returning HTTP 200.
  if (parts.length === 2 && parts[0] === 'support' && parts[1] === 'threads' &&
      request.method === 'GET' && request.nextUrl.searchParams.get('sort') === 'oldest' && response.ok) {
    try {
      if (!isVerifiedOldestSupportThreads(await response.clone().json())) {
        return gatewayProblem(503, 'Service Unavailable', 'support_order_unverified',
          'support conversation order could not be verified');
      }
    } catch {
      return gatewayProblem(503, 'Service Unavailable', 'support_order_unverified',
        'support conversation order could not be verified');
    }
  }

  // A stale backend must not provide invented owner-private support counts.
  if (parts.length === 3 && parts[0] === 'support' &&
      parts[1] === 'threads' && parts[2] === 'summary' && request.method === 'GET' && response.ok) {
    try {
      if (!parseSupportSummary(await response.clone().json())) {
        return gatewayProblem(503, 'Service Unavailable', 'support_summary_unverified',
          'support status counts are unavailable');
      }
    } catch {
      return gatewayProblem(503, 'Service Unavailable', 'support_summary_unverified',
        'support status counts are unavailable');
    }
  }


  // The Android receipt summary is valid only if it matches the exact owner-scoped rows.
  // Reject legacy/forged HTTP 200 responses rather than inventing spending totals.
  if (parts.length === 2 && parts[0] === 'shop' && parts[1] === 'purchases' &&
      request.method === 'GET' && response.ok) {
    try {
      const json = await response.clone().json();
      if (json && typeof json === 'object' && 'summary' in json && json.summary !== undefined && json.summary !== null) {
        if (!parseShopPurchaseHistory(json)) {
          return gatewayProblem(503, 'Service Unavailable', 'shop_receipts_unverified', 'purchase totals are unavailable');
        }
      }
    } catch {
      return gatewayProblem(503, 'Service Unavailable', 'shop_receipts_unverified', 'purchase totals are unavailable');
    }
  }

  if (parts.length === 3 && parts[0] === 'shop' && parts[1] === 'purchases' &&
      parts[2] === 'export' && request.method === 'GET' && response.ok) {
    try {
      if (!isJsonMediaType(response.headers.get('content-type')) ||
          !parseShopPurchaseExport(await response.clone().json())) {
        return gatewayProblem(503, 'Service Unavailable', 'shop_export_unverified',
          'Shop purchase export is unavailable');
      }
    } catch {
      return gatewayProblem(503, 'Service Unavailable', 'shop_export_unverified',
        'Shop purchase export is unavailable');
    }
  }

  if (securityEventPath && response.ok && !isJsonMediaType(response.headers.get('content-type'))) {
    return gatewayProblem(503, 'Service Unavailable', 'security_events_unverified', 'security activity evidence is unavailable');
  }

  if (walletRange && response.ok && !isJsonMediaType(response.headers.get('content-type'))) {
    return gatewayProblem(503, 'Service Unavailable', 'wallet_range_unverified', 'wallet calendar activity evidence is unavailable');
  }


  if (workAvailability && availabilityValues.length === 1 && response.ok) {
    try {
      if (!isVerifiedAvailableWorkBoard(await response.clone().json())) {
        return gatewayProblem(503, 'Service Unavailable', 'work_availability_unverified', 'task availability is unverified');
      }
    } catch {
      return gatewayProblem(503, 'Service Unavailable', 'work_availability_unverified', 'task availability is unverified');
    }
  }




  if (receiptAmountFilter && minAmounts.length === 1 && response.ok) {
    try {
      const payload: unknown = await response.clone().json();
      if (
        !payload ||
        typeof payload !== 'object' ||
        !('purchases' in payload) ||
        !Array.isArray(payload.purchases) ||
        payload.purchases.length > 100 ||
        !payload.purchases.every((row: unknown) => {
          if (!row || typeof row !== 'object' || !('amount' in row)) return false;
          const amount = row.amount;
          return (
            typeof amount === 'string' &&
            /^[1-9][0-9]{0,29}$/.test(amount) &&
            BigInt(amount) >= BigInt(minAmounts[0]!)
          );
        })
      ) {
        return gatewayProblem(
          503,
          'Service Unavailable',
          'shop_receipt_amount_unverified',
          'purchase amount evidence is unavailable',
        );
      }
    } catch {
      return gatewayProblem(
        503,
        'Service Unavailable',
        'shop_receipt_amount_unverified',
        'purchase amount evidence is unavailable',
      );
    }
  }


  const headers = appendAppContractHeaders(new Headers());
  for (const name of APP_API_RESPONSE_HEADERS) {
    const value = response.headers.get(name);
    if (value) headers.set(name, value);
  }
  for (const cookie of response.headers.getSetCookie()) headers.append('set-cookie', cookie);
  // Owner-scoped wallet balances and ledger activity must never inherit an
  // accidentally cacheable upstream response, including on Android clients.
  const privateShopReceipts = parts[0] === 'shop' && parts[1] === 'purchases';
  if (parts[0] === 'wallet' || parts[0] === 'privacy' || parts[0] === 'work' || parts[0] === 'support' || parts[0] === 'collections' || parts[0] === 'notifications' || (parts[0] === 'account' && parts[1] === 'security') || privateShopReceipts) headers.set('cache-control', 'private, no-store');
  if (parts[0] === 'wallet' || parts[0] === 'privacy' || parts[0] === 'work' || parts[0] === 'support' || parts[0] === 'collections' || parts[0] === 'notifications' || (parts[0] === 'account' && parts[1] === 'security') || privateShopReceipts) headers.set('x-robots-tag', 'noindex');

  if (request.method === 'HEAD' || response.status === 204 || response.status === 304) {
    return new NextResponse(null, { status: response.status, headers });
  }

  if (isJsonMediaType(response.headers.get('content-type'))) {
    const bytes = await response.arrayBuffer();
    try {
      const text = new TextDecoder().decode(bytes);
      const parsed = JSON.parse(text) as unknown;
      const compatible = addAppJsonCompatibility(parsed);
      if (securityEventPath && response.ok) {
        const verified = parseSecurityEvents(compatible);
        if (verified === null || securityCategory === null || !securityEventsMatchCategory(verified, securityCategory)) {
          return gatewayProblem(503, 'Service Unavailable', 'security_events_unverified', 'security activity evidence is unavailable');
        }
      }
      if (walletRange && response.ok && !verifiedWalletCalendarPage(compatible, walletRange, request.nextUrl.searchParams.get('direction') ?? 'all')) {
        return gatewayProblem(503, 'Service Unavailable', 'wallet_range_unverified', 'wallet calendar activity evidence is unavailable');
      }
      if (parts[0] === 'content' && parts[1] === 'chat' && parts[2] === 'upload' && response.ok &&
          compatible !== null && typeof compatible === 'object' && !Array.isArray(compatible)) {
        // Older backend images returned a redundant internal storage key.
        // Keep the owner-authorized URL but never expose a second raw key field.
        const publicReceipt = { ...compatible } as Record<string, unknown>;
        delete publicReceipt.storageKey;
        delete publicReceipt.storage_key;
        return new NextResponse(JSON.stringify(publicReceipt), { status: response.status, headers });
      }
      return new NextResponse(JSON.stringify(compatible), { status: response.status, headers });
    } catch {
      if (securityEventPath && response.ok) {
        return gatewayProblem(503, 'Service Unavailable', 'security_events_unverified', 'security activity evidence is unavailable');
      }
      if (walletRange && response.ok) {
        return gatewayProblem(503, 'Service Unavailable', 'wallet_range_unverified', 'wallet calendar activity evidence is unavailable');
      }
      return new NextResponse(bytes, { status: response.status, headers });
    }
  }

  return new NextResponse(response.body, { status: response.status, headers });
}

type Context = { params: Promise<{ path: string[] }> };
async function handle(request: NextRequest, context: Context) {
  const parts = (await context.params).path;
  const response = await proxy(request, parts);
  // Inventory holdings contain owner-scoped items, expiry and upkeep state.
  // Never inherit cacheable/crawlable upstream headers, even on errors or HEAD.
  if (parts[0] === 'shop' && parts[1] === 'holdings') {
    response.headers.set('cache-control', 'private, no-store');
    response.headers.set('x-robots-tag', 'noindex');
    response.headers.set('referrer-policy', 'no-referrer');
  }
  if (isWalletDetailPath(parts)) {
    response.headers.set('cache-control', 'private, no-store');
    response.headers.set('x-robots-tag', 'noindex');
    response.headers.set('referrer-policy', 'no-referrer');
  }
  // Help publication metadata and member-scoped reads must not inherit a
  // cacheable upstream policy, including when the upstream returns an error.
  if (parts[0] === 'help' || parts[0] === 'work' || parts[0] === 'support' || parts[0] === 'collections' || (parts[0] === 'account' && parts[1] === 'security') || parts[0] === 'bank' || parts[0] === 'banking' || parts[0] === 'chat' || (parts[0] === 'content' && parts[1] === 'chat')) {
    response.headers.set('cache-control', 'private, no-store');
    if (parts[0] === 'help' || parts[0] === 'work' || parts[0] === 'support' || parts[0] === 'collections' || (parts[0] === 'account' && parts[1] === 'security') || parts[0] === 'chat' || (parts[0] === 'content' && parts[1] === 'chat')) response.headers.set('x-robots-tag', 'noindex');
  }
  // Query-specific public board results are not stable crawlable pages.
  if (parts.length === 3 && parts[0] === 'board' && parts[1] === 'public' &&
      parts[2] === 'stock-posts' && request.nextUrl.searchParams.has('q')) {
    response.headers.set('cache-control', 'no-store');
    response.headers.set('x-robots-tag', 'noindex');
  }
  // Query-specific public board results are not stable crawlable pages.
  if (parts.length === 3 && parts[0] === 'board' && parts[1] === 'public' &&
      parts[2] === 'stock-posts' && request.nextUrl.searchParams.has('q')) {
    response.headers.set('cache-control', 'no-store');
    response.headers.set('x-robots-tag', 'noindex');
  }
  if (isVipChestPath(parts)) {
    response.headers.set('cache-control', 'private, no-store');
    response.headers.set('x-robots-tag', 'noindex');
  }
  return response;
}

export const GET = handle;
export const HEAD = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
