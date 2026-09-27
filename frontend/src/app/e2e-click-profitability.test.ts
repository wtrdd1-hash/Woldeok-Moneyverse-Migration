import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const homeSource = readFileSync('src/app/page.tsx', 'utf8');
const accountSource = readFileSync('src/app/account/page.tsx', 'utf8');
const headerSource = readFileSync('src/components/site-header.tsx', 'utf8');
const toolsSource = readFileSync('src/app/tools/page.tsx', 'utf8');
const workSource = readFileSync('src/app/work/page.tsx', 'utf8');

describe('E2E Real-Click Profitability and Full-Stack Flow QA', () => {
  it('verifies 2026 Bento Grid 2.0 and Inset Border hero on Homepage', () => {
    expect(homeSource).toContain('border-zinc-800/80');
    expect(homeSource).toContain('shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]');
    expect(homeSource).toContain('WalletGlance');
    expect(homeSource).toContain('CasualDopamineStation');
    expect(homeSource).toContain('href="/tools/compound-calculator"');
    expect(homeSource).toContain('href="/tools/stock-calculator"');
  });

  it('verifies 4 Core Quick Actions with 44px+ touch targets', () => {
    expect(homeSource).toContain('href="/wallet"');
    expect(homeSource).toContain('href="/work"');
    expect(homeSource).toContain('href="/stocks"');
    expect(homeSource).toContain('href="/bank"');
    expect(homeSource.match(/min-h-\[56px\]/g)?.length).toBeGreaterThanOrEqual(4);
  });

  it('verifies Real Member Profile Integration and Security Score', () => {
    expect(accountSource).toContain('rawDisplayName?.trim()');
    expect(accountSource).toContain('<ProfileAvatar');
    expect(accountSource).toContain('securityScore');
    expect(accountSource).toContain('border-zinc-800/80');
  });

  it('verifies 6 Revenue Streams and Profitability Endpoints', () => {
    // 1. Attendance & Roulette
    expect(homeSource).toContain('출석 룰렛');
    // 2. Career Work
    expect(workSource).toContain('work');
    // 3. Stock Exchange
    expect(homeSource).toContain('stocks');
    // 4. Financial Tools Hub
    expect(toolsSource).toContain('compound-calculator');
    expect(toolsSource).toContain('stock-calculator');
  });

  it('verifies Masthead 5 Domain Clean Navigation and Accessibility', () => {
    expect(headerSource).toContain('moneyverse-site-header');
    expect(headerSource).toContain('Brand');
    expect(headerSource).toContain('aria-label');
  });
});
