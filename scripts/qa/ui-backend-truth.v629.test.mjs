import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '../..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

test('grant review requires open backend admin security session and does not report fictitious payout', () => {
  const route = read('frontend/src/app/api/admin/treasury/grants/route.ts');
  assert.match(route, /\/api\/v1\/admin\/security/);
  assert.match(route, /consoleSession\.state/);
  assert.doesNotMatch(route, /isLoggedInMember|saveGrants|INITIAL_APPLICATIONS/);
  assert.match(route, /status:\s*503/);
});

test('admin grants listing does not silently substitute successful mock approvals', () => {
  const page = read('frontend/src/app/admin/treasury/grants/page.tsx');
  assert.doesNotMatch(page, /DEFAULT_APPLICATIONS|apiOrNull/);
  assert.match(page, /loadGrants/);
});

test('citizen treasury claim never reports nonexistent wallet payout', () => {
  const route = read('frontend/src/app/api/treasury/claim/route.ts');
  assert.doesNotMatch(route, /disbursedAmountWld|즉시 지급되었습니다/);
  assert.match(route, /status:\s*503/);
});

test('grant application API does not claim acceptance from unsigned file writes', () => {
  const route = read('frontend/src/app/api/treasury/apply-grant/route.ts');
  assert.match(route, /status:\s*503/);
  assert.doesNotMatch(route, /applicantId:\s*'usr-citizen'/);
});

test('venture financial UI does not mutate user balances or holdings as real transfers', () => {
  const page = read('frontend/src/app/businesses/ventures/page.tsx');
  assert.doesNotMatch(page, /setUserWldBalance\(/);
  assert.match(page, /시뮬레이션|미리보기/);
});

test('venture backend command handlers fail closed rather than returning fabricated receipts', () => {
  const file = read('backend/src/business/ventures.controller.ts');
  for (const name of ['investVenture','claimDividend','applyFounderPitch']) {
    assert.match(file, new RegExp(`async ${name}\\([\\s\\S]*?ServiceUnavailableException`));
  }
});

test('simulated auction does not update bids, burn fees or wallet on click', () => {
  const page = read('frontend/src/app/marketplace/auction/page.tsx');
  assert.doesNotMatch(page, /setUserBalance\(|setTotalBurnedWld\(|setItems\(/);
  assert.match(page, /시뮬레이션|미리보기/);
});

test('live admin blog and grants pages have navigation entries', () => {
  const nav = read('frontend/src/components/admin-sub-nav.tsx');
  assert.match(nav, /href: '\/admin\/blog'/);
  assert.match(nav, /href: '\/admin\/treasury\/grants'/);
  const categories = read('frontend/src/app/admin/areas.ts');
  assert.match(categories, /href: '\/admin\/blog'/);
  assert.match(categories, /href: '\/admin\/treasury\/grants'/);
});

test('quant, warfare and derivatives must not falsely claim persistent executions', () => {
  for (const name of ['frontend/src/app/tools/quant-studio/page.tsx','frontend/src/app/clubs/warfare/page.tsx','frontend/src/app/stocks/derivatives/page.tsx']) {
    assert.match(read(name), /시뮬레이션|미리보기/);
  }
  const quant = read('frontend/src/app/tools/quant-studio/page.tsx');
  assert.doesNotMatch(quant, /setBots\(\(prev\) => \[newBot/);
});

test('exposed blog operations page enforces elevated admin console before rendering', () => {
  const page = read('frontend/src/app/admin/blog/page.tsx');
  assert.match(page, /await requireAdminConsole\('\/admin\/blog'\)/);
});
