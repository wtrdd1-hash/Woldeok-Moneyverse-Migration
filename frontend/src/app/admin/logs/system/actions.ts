'use server';

import { api } from '@/lib/api';

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
  try {
    const query = new URLSearchParams({
      source,
      lines: String(lines),
    });
    if (filter && filter.trim()) {
      query.set('filter', filter.trim());
    }

    const res = await api<SystemLogData>(`/api/v1/admin/logs/system?${query.toString()}`);
    return { success: true, data: res };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '로그 조회 중 오류가 발생했습니다.';
    return { success: false, error: message };
  }
}
