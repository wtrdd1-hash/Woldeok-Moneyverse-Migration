'use server';

import { api } from '@/lib/api';
import { requireAdminConsole } from '@/lib/session';

export interface SystemLogData {
  source: string;
  sourceName: string;
  lines: string[];
  totalCount: number;
  truncated: boolean;
  timestamp: string;
  status: string;
}

export async function fetchSystemLogsAction(
  source: string,
  lines: number,
  filter?: string
): Promise<{ success: boolean; data?: SystemLogData; error?: string }> {
  const consoleSession = await requireAdminConsole('/admin/logs/system');
  if (!consoleSession.roles.some((role) => role.toLowerCase() === 'superadmin')) {
    return { success: false, error: '최고관리자 권한이 필요합니다.' };
  }
  if (!['NGINX_ERROR', 'NGINX_ACCESS', 'SPRING_BACKEND', 'FRONTEND'].includes(source) ||
      !Number.isInteger(lines) || lines < 1 || lines > 500 || (filter?.length ?? 0) > 120) {
    return { success: false, error: 'Invalid log query' };
  }
  try {
    const query = new URLSearchParams({
      source,
      lines: String(lines),
    });
    if (filter && filter.trim()) {
      query.set('filter', filter.trim());
    }

    const res = await api<SystemLogData>(`/api/v1/admin/logs/system?${query.toString()}`);
    if (!res || !Array.isArray(res.lines) || !['OK', 'EMPTY', 'UNAVAILABLE'].includes(res.status)) {
      return { success: false, error: 'Log source returned an invalid response' };
    }
    return { success: true, data: res };
  } catch {
    return { success: false, error: 'Log source is unavailable' };
  }
}

export interface SystemLogHistoryEntry {
  readonly timestamp: string;
  readonly source: string;
  readonly class: 'routine' | 'important';
  readonly severity: string;
  readonly id: string;
  readonly message: string;
}

export interface SystemLogHistory {
  readonly source: string;
  readonly classification: 'routine' | 'important' | 'all';
  readonly entries: readonly SystemLogHistoryEntry[];
  readonly totalCount: number;
  readonly nextCursor: string | null;
  readonly status: 'OK' | 'EMPTY';
  readonly timestamp: string;
}

const LOG_HISTORY_SOURCES = ['NGINX_ERROR', 'NGINX_ACCESS', 'SPRING_BACKEND', 'FRONTEND', 'LEGACY_BACKEND'] as const;

export async function fetchSystemLogHistoryAction(params: {
  source: string;
  classification: 'routine' | 'important' | 'all';
  start: string;
  end: string;
  filter: string;
  limit: number;
  cursor?: string;
}): Promise<{ success: boolean; data?: SystemLogHistory; error?: string }> {
  const admin = await requireAdminConsole('/admin/logs/system');
  if (!admin.roles.some((role) => role.toUpperCase() === 'SUPERADMIN')) {
    return { success: false, error: '최고관리자 권한이 필요합니다.' };
  }
  const from = Date.parse(params.start);
  const to = Date.parse(params.end);
  if (!LOG_HISTORY_SOURCES.some((s) => s === params.source) ||
      !['routine', 'important', 'all'].includes(params.classification) ||
      !Number.isFinite(from) || !Number.isFinite(to) || from > to ||
      to - from > 30 * 86400000 || to > Date.now() + 300000 ||
      !Number.isInteger(params.limit) || params.limit < 1 || params.limit > 500 ||
      params.filter.length > 120 || /[\u0000-\u001f]/.test(params.filter) ||
      (params.cursor?.length ?? 0) > 1024) {
    return { success: false, error: '잘못된 로그 검색 조건입니다.' };
  }
  const query = new URLSearchParams({
    source: params.source,
    classification: params.classification,
    start: new Date(from).toISOString(),
    end: new Date(to).toISOString(),
    filter: params.filter,
    limit: String(params.limit),
  });
  if (params.cursor) query.set('cursor', params.cursor);
  try {
    const data = await api<SystemLogHistory>('/api/v1/admin/logs/system/history?' + query.toString());
    if (!data || !Array.isArray(data.entries) || !['OK', 'EMPTY'].includes(data.status) ||
        data.source !== params.source) {
      return { success: false, error: '로그 보관소 응답이 올바르지 않습니다.' };
    }
    return { success: true, data };
  } catch {
    return { success: false, error: '로그 보관소를 조회할 수 없습니다. 중요 로그는 OTP 인증이 필요합니다.' };
  }
}

export async function requestLogHistoryOtpAction(): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdminConsole('/admin/logs/system');
  if (!admin.roles.some((r) => r.toUpperCase() === 'SUPERADMIN')) {
    return { success: false, error: '최고관리자 권한이 필요합니다.' };
  }
  try {
    const res = await api<{ ok: boolean }>('/api/v1/admin/logs/system/history/otp/request', { method: 'POST' });
    return res.ok ? { success: true } : { success: false, error: 'OTP 발송 요청이 거절되었습니다.' };
  } catch {
    return { success: false, error: 'OTP 발송 서버를 사용할 수 없습니다.' };
  }
}

export async function verifyLogHistoryOtpAction(code: string): Promise<{ success: boolean; error?: string }> {
  const admin = await requireAdminConsole('/admin/logs/system');
  if (!admin.roles.some((r) => r.toUpperCase() === 'SUPERADMIN')) {
    return { success: false, error: '최고관리자 권한이 필요합니다.' };
  }
  if (!/^[0-9]{6}$/.test(code)) {
    return { success: false, error: 'OTP 코드는 숫자 6자리여야 합니다.' };
  }
  try {
    const res = await api<{ ok: boolean }>('/api/v1/admin/logs/system/history/otp/verify', {
      method: 'POST',
      body: { otpCode: code },
    });
    return res.ok ? { success: true } : { success: false, error: 'OTP 검증에 실패했습니다.' };
  } catch {
    return { success: false, error: 'OTP가 틀렸거나 만료되었습니다.' };
  }
}
