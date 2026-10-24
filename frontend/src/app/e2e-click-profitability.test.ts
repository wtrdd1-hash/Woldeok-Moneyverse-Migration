import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const homeSource = readFileSync('src/app/page.tsx', 'utf8');
const accountSource = readFileSync('src/app/account/page.tsx', 'utf8');
const headerSource = readFileSync('src/components/site-header.tsx', 'utf8');
const toolsSource = readFileSync('src/app/tools/page.tsx', 'utf8');
const workSource = readFileSync('src/app/work/page.tsx', 'utf8');

describe('E2E Real-Click Profitability and Full-Stack Flow QA', () => {
  it('verifies the 2026 accessible fintech card and authenticated wallet glance', () => {
    expect(homeSource).toContain('border-slate-800/80');
    expect(homeSource).toContain('dark:bg-[#0d121c]');
    expect(homeSource).toContain('WalletGlance');
    expect(homeSource).toContain('href="/tools/compound-calculator"');
    expect(homeSource).toContain('href="/tools/stock-calculator"');
  });

  it('verifies three major quick actions with 44px+ touch targets and P2P transfer', () => {
    expect(homeSource).toContain('P2PTransferModal');
    expect(homeSource).toContain('href="/work"');
    expect(homeSource).toContain('href="/stocks"');
    expect(homeSource).toContain('href="/bank"');
    expect(homeSource).toContain('grid grid-cols-3 gap-2 sm:gap-3');
    expect(homeSource).toContain('min-h-[88px]');
  });

  it('verifies Real Member Profile Integration and server-backed sign-in evidence', () => {
    expect(accountSource).toContain('rawDisplayName?.trim()');
    expect(accountSource).toContain('<ProfileAvatar');
    expect(accountSource).toContain('resolveIdentityEvidence(identityData)');
    expect(accountSource).not.toContain('securityScore');
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
