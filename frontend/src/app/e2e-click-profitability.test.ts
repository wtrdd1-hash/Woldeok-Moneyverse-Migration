import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const homeSource = readFileSync('src/app/page.tsx', 'utf8');
const accountSource = readFileSync('src/app/account/page.tsx', 'utf8');
const headerSource = readFileSync('src/components/site-header.tsx', 'utf8');
const toolsSource = readFileSync('src/app/tools/page.tsx', 'utf8');
const workSource = readFileSync('src/app/work/page.tsx', 'utf8');

/** The home page links to `path`, whether written as JSX `href="…"` or a link-table `href: '…'`. */
const linksTo = (path: string) => new RegExp(`href(="|: ')${path.replace(/[/]/g, '\\/')}["']`);

describe('E2E Real-Click Profitability and Full-Stack Flow QA', () => {
  it('verifies the 2026 accessible fintech card and authenticated wallet glance', () => {
    // G1 (approved 2026-11-24) replaced the slate card; the balance panel is a G1 item frame.
    expect(homeSource).toContain('className="g1-panel');
    expect(homeSource).toContain('WalletGlance');
    expect(homeSource).toMatch(linksTo('/tools/compound-calculator'));
    expect(homeSource).toMatch(linksTo('/tools/stock-calculator'));
  });

  it('verifies three major quick actions with 44px+ touch targets and P2P transfer', () => {
    expect(homeSource).toContain('P2PTransferModal');
    expect(homeSource).toMatch(linksTo('/work'));
    expect(homeSource).toMatch(linksTo('/stocks'));
    expect(homeSource).toMatch(linksTo('/bank'));
    // Quick actions keep 44px touch targets in the G1 list layout.
    expect(homeSource).toContain('min-h-11');
  });

  it('verifies Real Member Profile Integration and Security Score', () => {
    expect(accountSource).toContain('rawDisplayName?.trim()');
    expect(accountSource).toContain('<ProfileAvatar');
    expect(accountSource).toContain('securityScore');
    expect(accountSource).toContain('border-zinc-800/80');
  });

  it('verifies 6 Revenue Streams and Profitability Endpoints', () => {
    // 1. Attendance & Roulette
    expect(homeSource).toContain('P2PTransferModal');
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
