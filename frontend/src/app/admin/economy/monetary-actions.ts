'use server';

import { revalidatePath } from 'next/cache';
import { failure, mutate } from '@/lib/mutate';

export type MonetaryCommand =
  | 'propose-ai' | 'update-regulation' | 'run-regulation' | 'propose'
  | 'approve' | 'freeze' | 'unfreeze' | 'execute-mint';

type Result = { success: true } | { success: false; error: string };
const ROUTES: Record<Exclude<MonetaryCommand, 'approve'>, string> = {
  'propose-ai': '/api/v1/admin/economy/monetary/ai-council/propose-policy',
  'update-regulation': '/api/v1/admin/economy/monetary/auto-regulation/update',
  'run-regulation': '/api/v1/admin/economy/monetary/auto-regulation/run',
  propose: '/api/v1/admin/economy/monetary/orders/propose',
  freeze: '/api/v1/admin/economy/monetary/freeze',
  unfreeze: '/api/v1/admin/economy/monetary/unfreeze',
  'execute-mint': '/api/v1/admin/economy/monetary/execute-mint',
};
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const AMOUNT = /^[1-9]\d{0,17}$/;
const invalid = (): Result => ({ success: false, error: '통화정책 요청 값을 다시 확인해 주세요.' });

/** A fixed server-side route allowlist. The browser never supplies a backend path or CSRF token. */
export async function runMonetaryCommand(command: MonetaryCommand, payload?: Record<string, unknown>): Promise<Result> {
  if (command !== 'approve' && !Object.prototype.hasOwnProperty.call(ROUTES, command)) return invalid();
  const data = payload ?? {};
  if (typeof data !== 'object' || Array.isArray(data)) return invalid();
  const keys = Object.keys(data);
  let path: string;
  let body: Record<string, unknown> | undefined;

  switch (command) {
    case 'approve':
      if (keys.length !== 1 || typeof data.id !== 'string' || !UUID.test(data.id)) return invalid();
      path = `/api/v1/admin/economy/monetary/orders/${encodeURIComponent(data.id)}/approve`;
      break;
    case 'update-regulation': {
      const allowed = ['is_enabled', 'target_faucet_sink_ratio', 'tolerance_band_pct', 'max_step_pct'];
      if (!keys.length || keys.some((key) => !allowed.includes(key))) return invalid();
      if (keys.some((key) => key === 'is_enabled' ? typeof data[key] !== 'boolean' : typeof data[key] !== 'number' || !Number.isFinite(data[key]) || (data[key] as number) < 0 || (data[key] as number) > 100)) return invalid();
      path = ROUTES[command]; body = data;
      break;
    }
    case 'propose':
      if (keys.some((key) => !['order_type', 'target_envelope', 'max_amount_wld', 'reason'].includes(key)) ||
        !['MINT', 'RETIRE'].includes(String(data.order_type)) ||
        typeof data.target_envelope !== 'string' || !/^[A-Z][A-Z0-9_]{1,63}$/.test(data.target_envelope) ||
        typeof data.max_amount_wld !== 'string' || !AMOUNT.test(data.max_amount_wld) ||
        typeof data.reason !== 'string' || data.reason.trim().length < 10 || data.reason.length > 1000) return invalid();
      path = ROUTES[command]; body = data;
      break;
    case 'freeze':
      if (keys.length !== 1 || typeof data.reason !== 'string' || data.reason.trim().length < 5 || data.reason.length > 1000) return invalid();
      path = ROUTES[command]; body = { reason: data.reason };
      break;
    case 'execute-mint':
      if (keys.some((key) => !['policy_order_id', 'amount_wld', 'recipient_user_id', 'idempotency_key'].includes(key)) ||
        typeof data.policy_order_id !== 'string' || !UUID.test(data.policy_order_id) ||
        typeof data.amount_wld !== 'string' || !AMOUNT.test(data.amount_wld) ||
        typeof data.idempotency_key !== 'string' || !UUID.test(data.idempotency_key) ||
        (data.recipient_user_id != null && (typeof data.recipient_user_id !== 'string' || !UUID.test(data.recipient_user_id)))) return invalid();
      path = ROUTES[command]; body = data;
      break;
    default:
      if (keys.length) return invalid();
      path = ROUTES[command];
  }

  try {
    // mutate obtains and spends a session-scoped CSRF token inside the Next server.
    const receipt = await mutate<unknown>(path, { body });
    if (!receipt || typeof receipt !== 'object' ||
      ('success' in receipt && receipt.success === false) ||
      ('status' in receipt && receipt.status === 'error')) {
      return { success: false, error: '통화정책 집행 결과를 확인할 수 없습니다.' };
    }
    revalidatePath('/admin/economy');
    return { success: true };
  } catch (error) {
    return { success: false, error: failure(error, '통화정책 요청을 처리하지 못했습니다.').message ?? '통화정책 요청을 처리하지 못했습니다.' };
  }
}
