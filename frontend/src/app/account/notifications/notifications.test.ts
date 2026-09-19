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
    expect(page).toContain('aria-pressed={board.notifications_enabled}');
    expect(page).toContain('aria-pressed={!board.notifications_enabled}');
    expect(page).toContain('className="grid gap-2 sm:grid-cols-2"');
    expect(page.match(/className="min-h-11 w-full"/g)).toHaveLength(2);
  });
  it('writes through the existing member preference API and refreshes quests', () => {
    expect(actions).toContain("'/api/v1/engagement/preferences'");
    expect(actions).toContain("method: 'PUT'");
    expect(actions).toContain("revalidatePath('/quests')");
  });
});
