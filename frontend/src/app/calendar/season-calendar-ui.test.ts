import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const page = readFileSync(join(process.cwd(), 'src/app/calendar/page.tsx'), 'utf8');

describe('season calendar verified source UI', () => {
  it('validates unknown season data before rendering and never turns invalid data into verified empty', () => {
    expect(page).toContain('parseSeasonCalendarEvents(seasonRaw)');
    expect(page).toContain('seasonEvents === null');
    expect(page).not.toContain('seasonData?.events ?? []');
  });

  it('keeps authenticated, nonindexed responsive calendar with keyboard retry on unknown', () => {
    expect(page).toContain('await requireMember()');
    expect(page).toContain('robots: { index: false, follow: false }');
    expect(page).toContain('md:grid-cols-2');
    expect(page).toContain('href="/calendar"');
    expect(page).toContain('role="alert"');
  });
});
