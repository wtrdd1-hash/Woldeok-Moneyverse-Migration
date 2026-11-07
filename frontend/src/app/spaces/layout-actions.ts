'use server';

import { api } from '@/lib/api';
import { mutate } from '@/lib/mutate';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export interface LayoutSaveResult {
  readonly status: 'ok' | 'error';
  readonly message: string;
}

// PostgreSQL jsonb reorders object keys. Compare canonical values, not raw JSON strings.
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b))
      .map(([key, nested]) => [key, canonical(nested)]));
  }
  return value;
}

export async function saveSpaceLayout(spaceId: string, layout: Record<string, unknown>): Promise<LayoutSaveResult> {
  if (typeof spaceId !== 'string' || !UUID.test(spaceId) ||
      !layout || typeof layout !== 'object' || Array.isArray(layout)) {
    return { status: 'error', message: '저장할 공간을 확인할 수 없습니다.' };
  }
  try {
    const serialized = JSON.stringify(layout);
    if (!serialized || serialized.length > 20000) {
      return { status: 'error', message: '인테리어 배치 크기를 확인해 주세요.' };
    }
    // mutate() reads the current session CSRF token server-side and sends it once.
    const receipt: unknown = await mutate(`/api/v1/spaces/${spaceId}/layout`, {
      method: 'PUT', body: { layout },
    });
    if (!receipt || typeof receipt !== 'object' || !('ok' in receipt) || receipt.ok !== true) {
      return { status: 'error', message: '서버 저장 결과를 확인할 수 없습니다.' };
    }
    const readback: unknown = await api(`/api/v1/spaces/${spaceId}`);
    if (!readback || typeof readback !== 'object' || !('space' in readback) ||
        !readback.space || typeof readback.space !== 'object' ||
        !('id' in readback.space) || readback.space.id !== spaceId ||
        !('layout' in readback.space) ||
        JSON.stringify(canonical(readback.space.layout)) !== JSON.stringify(canonical(layout))) {
      return { status: 'error', message: '저장된 배치가 요청 내용과 일치하는지 확인할 수 없습니다.' };
    }
    return { status: 'ok', message: '서버에 저장된 인테리어 배치를 확인했습니다.' };
  } catch {
    return { status: 'error', message: '서버 저장을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.' };
  }
}
