import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mutateMock, consoleMock } = vi.hoisted(() => ({
  mutateMock: vi.fn(),
  consoleMock: vi.fn(),
}));

vi.mock('@/lib/mutate', () => ({ mutate: mutateMock }));
vi.mock('@/lib/session', () => ({ requireAdminConsole: consoleMock }));

import { triggerAdminBackup } from './actions';

beforeEach(() => {
  vi.clearAllMocks();
  consoleMock.mockResolvedValue({});
});

describe('administrator backup action', () => {
  it('uses an authenticated console and the CSRF-aware server mutation', async () => {
    mutateMock.mockResolvedValue({ message: 'accepted', triggeredAt: '2026-10-24T01:00:00.000Z' });
    const result = await triggerAdminBackup();
    expect(consoleMock).toHaveBeenCalledWith('/admin/api-health');
    expect(mutateMock).toHaveBeenCalledWith('/api/v1/admin/backups/trigger');
    expect(result.status).toBe('ok');
    expect(result.message).not.toMatch(/completed|완료되었습니다/);
  });

  it('refuses a success indication when the backend does not confirm acceptance', async () => {
    mutateMock.mockResolvedValue({});
    const result = await triggerAdminBackup();
    expect(result.status).toBe('error');
  });

  it('never posts a backup request directly from the browser', () => {
    const source = readFileSync(new URL('./api-health-dashboard.tsx', import.meta.url), 'utf8');
    expect(source).not.toMatch(/fetch\(['"]\/api\/v1\/admin\/backups\/trigger/);
    expect(source).toContain('triggerAdminBackup(');
  });
});
