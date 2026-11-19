#!/usr/bin/env python3
"""Scoped approved Moneyverse homepage contract; run before and after implementation."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'spring-backend/src/main/resources/static/index.html').read_text()
ASSET=ROOT/'spring-backend/src/main/resources/static/assets/mv39'
checks=[
 ('Spring static home has a real app shell', 'class="app-shell"' in HTML and 'id="page-content"' in HTML),
 ('Dedicated locale choice with Auto and en/ko/ja/zh/vi', all(f'value="{key}"' in HTML for key in ['auto','en','ko','ja','zh','vi'])),
 ('Mobile bottom navigation exists', 'class="bottom-tabs"' in HTML),
 ('No synthetic treasury 100 trillion', '100,000,000,000,000' not in HTML),
 ('No fictional 2.41% or member count', '2.41%' not in HTML and '12,840' not in HTML and '1,420' not in HTML),
 ('No system health / Netty telemetry in member homepage', 'Netty 9092' not in HTML and '99.99%' not in HTML),
 ('No expired Next.js CSS in Spring home', '/_next/static/css/' not in HTML),
 ('CSS and JS are local immutable scoped assets', all(x.exists() for x in [ASSET/'site.css',ASSET/'i18n.js',ASSET/'app.js'])),
 ('No public admin-monitoring link on homepage', '/admin-preview' not in HTML),
 ('Accessible menu, headings and skip link', 'aria-controls="mobile-menu"' in HTML and 'class="skip-link"' in HTML),
]
if (ASSET/'app.js').exists():
 js=(ASSET/'app.js').read_text()
 checks.extend([
  ('Authenticated wallet only, never fake', "'/api/v1/wallet/summary'" in js and 'isSignedIn()' in js and 'totalAvailableAmount' in js),
  ('No invented board posts on homepage (BoardService fallback risk)', "listFeed('/api/v1/board',4,'board')" not in js and "state(t('postsPending'))" in js),
  ('No personal stock fetch while Spring owner scope is unverified', "fetchJson('/api/v1/stocks/portfolio')" not in js),
  ('No fake chart, no fabricated gain', all(token not in js for token in ['Math.random','fakeTrend','syntheticGain'])),
  ('Session reset cancels data on account switching', 'epoch++' in js and 'sessionEpoch' in js and 'visibilitychange' in js),
  ('Current Spring stock route linked', "action('/stocks'" in js),
 ])
fail=[name for name,ok in checks if not ok]
for name,ok in checks:print(('PASS' if ok else 'FAIL')+' '+name)
print(f'{len(checks)-len(fail)}/{len(checks)} PASS')
if fail:raise SystemExit(1)
