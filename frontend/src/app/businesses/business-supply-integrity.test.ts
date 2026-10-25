// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const widget = readFileSync('src/app/businesses/supply-chain-widget.tsx', 'utf8');
const page = readFileSync('src/app/businesses/page.tsx', 'utf8');

describe('verified business supply chain UI', () => {
  it('never creates a fake procurement receipt or simulated WLD payment', () => {
    expect(widget).not.toMatch(/setLastReceipt|receiptOpen|setTimeout|totalCost\s*=\s*unitPrice/);
    expect(widget).not.toContain('조달 결제 및 입고 완료');
  });
  it('uses the authenticated server API and verifies ownership before displaying a business', () => {
    expect(widget).toContain('apiOrNull');
    expect(widget).toContain('businessId');
    expect(widget).toContain('ownershipId === businessId');
    expect(widget).toContain('공급망 조달은 현재 이용할 수 없습니다');
  });
  it('offers accessible navigation without fake inventory and hides member business data from indexing', () => {
    expect(widget).toContain('min-h-11');
    expect(widget).toContain('focus-visible:');
    expect(widget).toContain('href="/businesses"');
    expect(page).toContain('robots: { index: false, follow: false }');
    expect(widget).not.toContain('1.155');
    expect(widget).not.toContain('currentUsed = 140');
  });
});
