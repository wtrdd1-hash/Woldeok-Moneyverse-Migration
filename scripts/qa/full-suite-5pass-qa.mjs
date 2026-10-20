import { BACKEND_API_EXPECTATIONS } from './http-guard-policy.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { assessFullSiteAcceptance } from './e2e-certification.mjs';

const INVENTORY_PATH = path.resolve('artifacts/qa/route-inventory.json');
const BASE_URL = process.env.QA_BASE_URL || 'http://127.0.0.1:3101';
const API_URL = process.env.QA_API_URL || 'http://127.0.0.1:3100';

// Real validated fixtures from PostgreSQL DB and Next.js generateStaticParams configurations
const ROUTE_EXACT_FIXTURES = {
  '/[locale]/blog': '/en/blog',
  '/[locale]/blog/[slug]': '/en/blog/2026-10-14-compound-mv83xp86',
  '/[locale]/guide/glossary': '/en/guide/glossary',
  '/[locale]/guide/glossary/[term]': '/en/guide/glossary/compound-interest',
  '/[locale]/tools/compound-interest-calculator': '/en/tools/compound-interest-calculator',
  '/[locale]/tools/compound-interest-calculator/[preset]': '/en/tools/compound-interest-calculator/500-monthly-20-years-8-percent',
  '/blog/[slug]': '/blog/2026-10-14-compound-mv83xp86',
  '/board/[postId]': '/board/e46b3a8c-ce0e-497c-b85d-747e234b1c51',
  '/guide/glossary/[term]': '/guide/glossary/compound-interest',
  '/profile/[userId]': '/profile/1',
  '/admin/users/[id]': '/admin/users/1',
  '/stocks/[symbol]': '/stocks/WLD',
  '/invite/[code]': '/invite/TESTINVITE',
  '/tools/capital-gains-tax-calculator/[preset]': '/tools/capital-gains-tax-calculator/nvda-gain-5m',
  '/tools/compound-calculator/[preset]': '/tools/compound-calculator/10m-3y-5p',
  '/tools/dividend-tax-calculator/[ticker]': '/tools/dividend-tax-calculator/o',
  '/tools/farming-calculator/[preset]': '/tools/farming-calculator/intern-vs-executive',
  '/tools/gift-tax-calculator/[preset]': '/tools/gift-tax-calculator/parents-to-adult-child-50m',
  '/tools/isa-calculator/[slug]': '/tools/isa-calculator/isa-general-200m',
  '/tools/kimchi-premium-calculator/[preset]': '/tools/kimchi-premium-calculator/btc',
  '/tools/loan-interest-calculator/[preset]': '/tools/loan-interest-calculator/30m-credit-3y-5pct',
  '/tools/pension-tax-calculator/[slug]': '/tools/pension-tax-calculator/pension-300m',
  '/tools/real-estate-calculator/[preset]': '/tools/real-estate-calculator/gangnam-office',
  '/tools/retirement-calculator/[slug]': '/tools/retirement-calculator/service-1year',
  '/tools/salary-calculator/[preset]': '/tools/salary-calculator/salary-2400m',
  '/tools/stock-calculator/[preset]': '/tools/stock-calculator/chips-minus-20',
  '/tools/youth-leap-calculator/[preset]': '/tools/youth-leap-calculator/700k-24m-max',
  // Dynamic detail routes without seed database records return fail-closed notFound() (404)
  '/announcements/[announcementId]': '/announcements/empty-notice',
  '/gallery/[photoId]': '/gallery/empty-photo',
  '/clubs/[clubId]': '/clubs/empty-club',
  '/clubs/[clubId]/members': '/clubs/empty-club/members',
};

function resolveDynamicRoute(routeTemplate) {
  if (ROUTE_EXACT_FIXTURES[routeTemplate]) {
    return ROUTE_EXACT_FIXTURES[routeTemplate];
  }
  let resolved = routeTemplate;
  resolved = resolved.replace('[locale]', 'en');
  resolved = resolved.replace('[slug]', '2026-10-14-compound-mv83xp86');
  resolved = resolved.replace('[preset]', '10m-3y-5p');
  resolved = resolved.replace('[symbol]', 'WLD');
  resolved = resolved.replace('[ticker]', 'o');
  resolved = resolved.replace('[id]', '1');
  return resolved;
}

async function fetchRoute(routePath, customHeaders = {}) {
  const url = `${BASE_URL}${routePath}`;
  const start = Date.now();
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Moneyverse-QA-Agent/v800 (Automated 5-Pass Resilience Sentinel)',
        'x-forwarded-proto': 'https',
        'Host': 'test.easy-scraping.com',
        ...customHeaders,
      },
      redirect: 'manual',
    });
    const durationMs = Date.now() - start;
    const body = await res.text();
    return {
      status: res.status,
      ok: res.status >= 200 && res.status < 400,
      headers: Object.fromEntries(res.headers.entries()),
      durationMs,
      body,
    };
  } catch (err) {
    return {
      status: 0,
      ok: false,
      headers: {},
      durationMs: Date.now() - start,
      error: err.message,
      body: '',
    };
  }
}

async function run() {
  console.log('=== [Woldeok Moneyverse HTTP-only route smoke; NOT full E2E acceptance] ===');
  console.log(`Target Frontend: ${BASE_URL}`);
  console.log(`Target Backend:  ${API_URL}`);

  if (!fs.existsSync(INVENTORY_PATH)) {
    throw new Error(`Inventory file not found: ${INVENTORY_PATH}`);
  }

  const inventory = JSON.parse(fs.readFileSync(INVENTORY_PATH, 'utf8'));
  const pages = inventory.pages;
  console.log(`Loaded ${pages.length} unique route definitions from inventory.\n`);

  const results = {
    pass1: { name: 'HTTP 200 & SSR Rendering Integrity', passed: 0, failed: 0, details: [] },
    pass2: { name: 'Static HTML width heuristic only (no rendered viewport measurements)', passed: 0, failed: 0, details: [] },
    pass3: { name: '4-locale HTTP response header check only (not content correctness)', passed: 0, failed: 0, details: [] },
    pass4: { name: 'Finance page availability only (no 100T WLD data injected)', passed: 0, failed: 0, details: [] },
    pass5: { name: 'Admin route availability and public API guards (no signed-in transaction)', passed: 0, failed: 0, details: [] },
  };

  // -------------------------------------------------------------
  // PASS 1: HTTP 200 & SSR Rendering Integrity (166 Routes)
  // -------------------------------------------------------------
  console.log('>>> [PASS 1/5] Executing HTTP 200 & SSR Rendering Integrity Sweep on all 166 routes...');
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    const targetRoute = resolveDynamicRoute(p.route);
    const resp = await fetchRoute(targetRoute);

    const hasCriticalError =
      resp.body.includes('Internal Server Error') ||
      resp.body.includes('Application error: a client-side exception has occurred') ||
      resp.body.includes('Unhandled Runtime Error');

    // Per Spec 3: Empty detail routes without DB seed rows must fail-closed with HTTP 404
    const isExpectedEmptyDetail =
      (p.route.startsWith('/announcements/') || p.route.startsWith('/gallery/') || p.route.startsWith('/clubs/')) &&
      resp.status === 404;

    const pass = ((resp.status === 200 || resp.status === 307 || resp.status === 308) || isExpectedEmptyDetail) && !hasCriticalError;

    if (pass) {
      results.pass1.passed++;
    } else {
      results.pass1.failed++;
    }

    results.pass1.details.push({
      route: p.route,
      resolvedRoute: targetRoute,
      status: resp.status,
      durationMs: resp.durationMs,
      pass,
      error: hasCriticalError ? 'Critical runtime error found in HTML' : resp.error || null,
    });

    if ((i + 1) % 35 === 0 || i === pages.length - 1) {
      console.log(`  [Pass 1 Progress] ${i + 1}/${pages.length} routes checked. Passed: ${results.pass1.passed}, Failed: ${results.pass1.failed}`);
    }
  }

  // -------------------------------------------------------------
  // PASS 2: 5-Viewport Responsive & Horizontal Overflow Defense
  // -------------------------------------------------------------
  console.log('\n>>> [PASS 2/5] Checking a static HTML width heuristic (NOT 320–1280px browser rendering)...');
  const layoutSampleRoutes = [
    '/', '/stocks', '/stocks/WLD', '/bank', '/casino',
    '/wallet', '/shop', '/work', '/tools', '/tools/compound-calculator',
    '/tools/dividend-tax-calculator', '/tools/loan-interest-calculator', '/blog',
    '/blog/2026-10-14-compound-mv83xp86', '/admin', '/admin/treasury', '/admin/market', '/admin/users'
  ];

  for (const routePath of layoutSampleRoutes) {
    const resp = await fetchRoute(routePath, { 'x-moneyverse-role': 'administrator' });
    const hasFixedHugeWidth = /width:\s*[0-9]{4,}px/i.test(resp.body) || /min-w-\[[0-9]{4,}px\]/i.test(resp.body);
    const pass = resp.ok && !hasFixedHugeWidth;
    if (pass) {
      results.pass2.passed++;
    } else {
      results.pass2.failed++;
    }
    results.pass2.details.push({
      route: routePath,
      hasFixedHugeWidth,
      pass,
    });
  }
  console.log(`  [Pass 2 Complete] Checked ${layoutSampleRoutes.length} key surfaces. Passed: ${results.pass2.passed}, Failed: ${results.pass2.failed}`);

  // -------------------------------------------------------------
  // PASS 3: 4-Locale (ko/en/ja/zh) Dynamic & SSR Parity
  // -------------------------------------------------------------
  console.log('\n>>> [PASS 3/5] Checking 4 locale response headers (NOT translated content parity)...');
  const locales = [
    { code: 'ko', country: 'KR', expectedHeader: 'ko' },
    { code: 'ja', country: 'JP', expectedHeader: 'ja' },
    { code: 'zh', country: 'CN', expectedHeader: 'zh' },
    { code: 'en', country: 'US', expectedHeader: 'en' },
  ];

  const multilingualRoutes = [
    '/', '/blog', '/blog/2026-10-14-compound-mv83xp86', '/tools/compound-calculator', '/guide/glossary'
  ];

  for (const route of multilingualRoutes) {
    for (const loc of locales) {
      const resp = await fetchRoute(route, { 'CF-IPCountry': loc.country });
      const returnedLocale = resp.headers['x-moneyverse-locale'];
      const pass = returnedLocale === loc.expectedHeader && resp.ok;

      if (pass) {
        results.pass3.passed++;
      } else {
        results.pass3.failed++;
      }

      results.pass3.details.push({
        route,
        locale: loc.code,
        country: loc.country,
        returnedLocale,
        pass,
      });
    }
  }
  console.log(`  [Pass 3 Complete] Checked ${multilingualRoutes.length * locales.length} locale-route pairs. Passed: ${results.pass3.passed}, Failed: ${results.pass3.failed}`);

  // -------------------------------------------------------------
  // PASS 4: Finance HTTP Availability, NOT 100T WLD Stress
  // -------------------------------------------------------------
  console.log('\n>>> [PASS 4/5] Testing Finance HTTP Availability, NOT 100T WLD Stress...');
  const financialRoutes = [
    '/stocks', '/bank', '/wallet', '/casino', '/work', '/admin/treasury', '/admin/market'
  ];

  for (const route of financialRoutes) {
    const resp = await fetchRoute(route, { 'x-moneyverse-role': 'administrator' });
    const pass = resp.ok;
    if (pass) {
      results.pass4.passed++;
    } else {
      results.pass4.failed++;
    }
    results.pass4.details.push({
      route,
      pass,
    });
  }
  console.log(`  [Pass 4 Complete] Checked ${financialRoutes.length} financial balance surfaces. Passed: ${results.pass4.passed}, Failed: ${results.pass4.failed}`);

  // -------------------------------------------------------------
  // PASS 5: Admin 34 Routes & Real Transactions Integrity
  // -------------------------------------------------------------
  console.log('\n>>> [PASS 5/5] Verifying Anonymous Admin Route Responses & API Auth Guards...');
  const adminPages = pages.filter((p) => p.administrator);

  for (const ap of adminPages) {
    const targetRoute = resolveDynamicRoute(ap.route);
    const resp = await fetchRoute(targetRoute, { 'x-moneyverse-role': 'administrator' });
    const pass = resp.status === 200 || resp.status === 307 || resp.status === 308;

    if (pass) {
      results.pass5.passed++;
    } else {
      results.pass5.failed++;
    }

    results.pass5.details.push({
      route: ap.route,
      resolvedRoute: targetRoute,
      status: resp.status,
      pass,
    });
  }
  console.log(`  [Pass 5 Admin Subtotal] Checked ${adminPages.length} admin routes. Passed: ${results.pass5.passed}, Failed: ${results.pass5.failed}`);

  // Direct backend without an internal token; 401 is expected for internal-only reads.
  const backendApis = BACKEND_API_EXPECTATIONS;

  console.log('  [Pass 5 Backend APIs] Probing core live public endpoints & auth security guards...');
  for (const endpoint of backendApis) {
    try {
      const res = await fetch(`${API_URL}${endpoint.path}`);
      const pass = res.status === endpoint.expectedStatus;
      if (pass) results.pass5.passed++;
      else results.pass5.failed++;
      results.pass5.details.push({
        route: `[API] ${endpoint.path} (${endpoint.kind})`,
        status: res.status,
        expectedStatus: endpoint.expectedStatus,
        pass,
      });
    } catch (e) {
      results.pass5.failed++;
      results.pass5.details.push({
        route: `[API] ${endpoint.path}`,
        status: 0,
        pass: false,
        error: e.message,
      });
    }
  }

  // Summary Report
  console.log('\n=============================================================');
  console.log('           HTTP ROUTE SMOKE SUMMARY — E2E NOT CERTIFIED        ');
  console.log('=============================================================');
  console.log(`Pass 1 (HTTP 200 / SSR Integrity):    ${results.pass1.passed} / ${results.pass1.passed + results.pass1.failed} (${results.pass1.failed === 0 ? '✓ PASS' : '✗ FAIL'})`);
  console.log(`Pass 2 (HTML Width Heuristic, NOT Actual Viewport): ${results.pass2.passed} / ${results.pass2.passed + results.pass2.failed} (${results.pass2.failed === 0 ? '✓ PASS' : '✗ FAIL'})`);
  console.log(`Pass 3 (country/locale headers only): ${results.pass3.passed} / ${results.pass3.passed + results.pass3.failed} (${results.pass3.failed === 0 ? '✓ PASS' : '✗ FAIL'})`);
  console.log(`Pass 4 (finance HTTP only):  ${results.pass4.passed} / ${results.pass4.passed + results.pass4.failed} (${results.pass4.failed === 0 ? '✓ PASS' : '✗ FAIL'})`);
  console.log(`Pass 5 (anonymous guards only):      ${results.pass5.passed} / ${results.pass5.passed + results.pass5.failed} (${results.pass5.failed === 0 ? '✓ PASS' : '✗ FAIL'})`);
  console.log('=============================================================');

  const totalTests = results.pass1.passed + results.pass1.failed +
    results.pass2.passed + results.pass2.failed +
    results.pass3.passed + results.pass3.failed +
    results.pass4.passed + results.pass4.failed +
    results.pass5.passed + results.pass5.failed;
  const totalPassed = results.pass1.passed + results.pass2.passed + results.pass3.passed + results.pass4.passed + results.pass5.passed;
  const totalFailed = totalTests - totalPassed;

  console.log(`TOTAL CHECKS: ${totalTests} | PASSED: ${totalPassed} | FAILED: ${totalFailed}`);

  // No viewport/browser/login/ledger receipt instrumentation runs above. Even a
  // perfectly green HTTP report MUST NOT be advertised as full feature QA.
  const acceptance = assessFullSiteAcceptance({ httpRoutes: totalFailed === 0 });
  results.assurance = acceptance;
  console.log(`FULL FUNCTIONAL ACCEPTANCE: ${acceptance.status}`);
  console.log(`Missing independent proofs: ${acceptance.missing.join(', ')}`);

  const reportPath = path.resolve('artifacts/qa/full-5pass-qa-report.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`Detailed report saved to: ${reportPath}`);

  // Release/QA callers must use the authenticated evidence ledger validator.
  // HTTP success is intentionally insufficient, and defaults to fail-closed.
  if (totalFailed > 0 || !acceptance.ok) {
    process.exitCode = 2;
  }
}

run().catch((err) => {
  console.error('Fatal QA Runner Error:', err);
  process.exit(1);
});
