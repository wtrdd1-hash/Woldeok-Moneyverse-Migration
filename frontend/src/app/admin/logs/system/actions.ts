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
  await requireAdminConsole('/admin/logs/system');
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
  } catch (err: unknown) {
    return { success: false, error: 'Log source is unavailable' };
  }
}
