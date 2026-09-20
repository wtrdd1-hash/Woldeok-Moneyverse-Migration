import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const page = readFileSync(join(process.cwd(), 'src/app/account/notifications/page.tsx'), 'utf8');
const actions = readFileSync(join(process.cwd(), 'src/app/account/notifications/actions.ts'), 'utf8');

describe('account notification settings', () => {
  it('reads the authoritative engagement preference and offers both choices', () => {
    expect(page).toContain("apiOrNull<{ notifications_enabled: boolean }>('/api/v1/engagement')");
    expect(page).toContain('value="true"');
    expect(page).toContain('value="false"');
    expect(page).toContain('aria-pressed={enabled}');
    expect(page).toContain('aria-pressed={!enabled}');
    expect(page).toContain('aria-label="목표 및 NPC 주문 알림 설정"');
    expect(page).toContain("enabled ? '알림 받는 중' : '알림 꺼짐'");
    expect(page.match(/className="min-h-12 w-full"/g)).toHaveLength(2);
    expect(page).toContain('설정을 바꾸지 않았으니');
  });
  it('writes through the existing member preference API and refreshes quests', () => {
    expect(actions).toContain("'/api/v1/engagement/preferences'");
    expect(actions).toContain("method: 'PUT'");
    expect(actions).toContain("revalidatePath('/quests')");
  });
});
