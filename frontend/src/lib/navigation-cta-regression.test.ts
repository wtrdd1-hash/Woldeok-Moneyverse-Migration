import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
const read = (path: string) => readFileSync(path, 'utf8');
describe('public acquisition and help links', () => {
  it.each(['isa-calculator', 'salary-calculator', 'pension-tax-calculator', 'youth-leap-calculator'])('%s links to the real signup page', kind => {
    const s = read('src/app/tools/' + kind + '/page.tsx');
    expect(s).toContain('href="/register"');
    expect(s).not.toContain('href="/auth/register"');
    expect(s).not.toContain('무료 10,000 WLD');
    expect(s).not.toContain('지원금 10,000 WLD');
    expect(s).not.toContain('onClick={() => setIsWldClaimed(true)}');
  });
  it.each([
    ['src/components/discord-banner.tsx', '/quests', '/attendance'],
    ['src/components/calculator-retention-funnel.tsx', '/guide/career-mastery', '/career-guide'],
    ['src/components/floating-support-chat-widget.tsx', '/guide', '/guide/getting-started'],
    ['src/app/roadmap/roadmap-view.tsx', '/roadmap', '/pet'],
  ])('%s points at a real page', (file, target, wrong) => {
    const s = read(file);
    expect(s).toContain('href="' + target + '"');
    expect(s).not.toContain('href="' + wrong + '"');
  });
});
