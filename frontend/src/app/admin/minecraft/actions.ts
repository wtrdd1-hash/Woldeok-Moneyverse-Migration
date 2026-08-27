'use server';

import type { ActionState } from '@/lib/action-state';
import { failure, idempotencyKey, mutate } from '@/lib/mutate';

/** The five fixed operations. Nothing else can be named. */
const OPERATIONS = new Set(['status', 'logs', 'start', 'restart', 'stop']);

/**
 * Requests one fixed host operation.
 *
 * This records a request; it does not reach the host. A separate approver has
 * to decide it, and a host-local worker — not this application — leases and
 * runs it. No command, path, unit name or argument crosses this boundary:
 * only which of the five operations was asked for.
 */
export async function requestOperation(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const operation = String(formData.get('operation') ?? '');
  if (!OPERATIONS.has(operation)) {
    return { status: 'error', message: '요청할 작업을 확인할 수 없어요.' };
  }

  try {
    const receipt = await mutate<{ operationId: string; state: string; replayed: boolean }>(
      '/api/v1/admin/minecraft/operations',
      { body: { operation, idempotencyKey: idempotencyKey() } },
    );
    return {
      status: 'ok',
      message: receipt.replayed
        ? `이미 기록된 요청이에요. 작업 ID ${receipt.operationId}`
        : `요청을 기록했어요. 작업 ID ${receipt.operationId} · 상태 ${receipt.state}`,
    };
  } catch (error) {
    return failure(error, '지금은 작업을 요청할 수 없어요. server_operator 역할이 필요합니다.');
  }
}
