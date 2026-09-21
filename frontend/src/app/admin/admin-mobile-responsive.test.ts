import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const aiStatus = readFileSync('src/app/admin/economy/ai-status-card.tsx', 'utf8');
const traffic = readFileSync('src/app/admin/logs/activity/traffic-dashboard.tsx', 'utf8');
const activity = readFileSync('src/app/admin/logs/activity/page.tsx', 'utf8');
const logForms = readFileSync('src/app/admin/logs/logs-forms.tsx', 'utf8');

describe('administrator mobile responsive guards', () => {
  it('uses stacked AI agent cards below the small breakpoint and keeps the desktop table', () => {
    expect(aiStatus).toContain('className="grid gap-2 sm:hidden"');
    expect(aiStatus).toContain('className="hidden overflow-x-auto sm:block"');
  });

  it('uses stacked traffic rows below the small breakpoint', () => {
    expect(traffic).toContain('className="grid gap-2 sm:hidden"');
    expect(traffic).toContain('className="hidden overflow-x-auto sm:block"');
  });

  it('uses mobile activity cards and full-width filters instead of forcing a wide table', () => {
    expect(activity).toContain('className="grid gap-3 md:hidden"');
    expect(activity).toContain('className="hidden overflow-x-auto md:block"');
    expect(activity).toContain('className="w-full sm:w-48"');
    expect(activity).toContain('className="w-full sm:w-28"');
  });

  it('lets audit reveal disclosures shrink below 280px without document overflow', () => {
    expect(logForms).toContain('className="w-full min-w-0 max-w-[480px]');
    expect(logForms).not.toContain('min-w-[280px]');
  });
});
