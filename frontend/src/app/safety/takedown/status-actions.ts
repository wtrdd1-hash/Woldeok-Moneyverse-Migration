'use server';

import { ApiError, api } from '@/lib/api';
import { parseTakedownStatus, type TakedownReceipt } from './takedown-status';

export interface TakedownLookupState {
  readonly status: 'idle' | 'ok' | 'error';
  readonly message?: string;
  readonly receipt?: TakedownReceipt;
}

export async function lookupEmergencyTakedown(
  _previous: TakedownLookupState,
  formData: FormData,
): Promise<TakedownLookupState> {
  const rawCaseId = formData.get('caseId');
  const rawPasscode = formData.get('passcode');
  const caseId = typeof rawCaseId === 'string' ? rawCaseId.trim() : '';
  // Do not trim a secret: the backend hashes the exact passcode bytes.
  const passcode = typeof rawPasscode === 'string' ? rawPasscode : '';
  if (!/^[A-Za-z0-9-]{5,32}$/.test(caseId) || passcode.length < 6 || passcode.length > 64) {
    return { status: 'error', message: '접수 번호와 6~64자리 비밀번호를 확인해 주세요.' };
  }
  try {
    const response: unknown = await api('/api/v1/safety/takedown/status', {
      method: 'POST', body: { caseId, passcode }, timeoutMs: 10000,
    });
    const receipt = parseTakedownStatus(response);
    if (!receipt || receipt.caseId !== caseId) {
      return { status: 'error', message: '조회 응답을 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.' };
    }
    return { status: 'ok', message: '접수 상태를 확인했습니다.', receipt };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { status: 'error', message: '접수 번호 또는 비밀번호가 일치하지 않습니다.' };
    }
    if (error instanceof ApiError && error.status === 429) {
      return { status: 'error', message: '조회 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' };
    }
    return { status: 'error', message: '상태 조회가 일시적으로 불가능합니다. 잠시 후 다시 시도해 주세요.' };
  }
}
