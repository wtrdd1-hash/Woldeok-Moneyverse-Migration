#!/usr/bin/env python3
"""Read-only SEO gateway contract and negative authorization smoke test.

Avoids external search engine submissions. All requests are made without credentials.
"""
import json
import os
import sys
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

base = os.getenv('SEO_GATEWAY_BASE', 'http://127.0.0.1:4400').rstrip('/')

def request(path, *, method='GET'):
    req = Request(base + path, headers={'Accept': 'application/json'}, method=method)
    try:
        with urlopen(req, timeout=6) as resp:
            return resp.status, resp.read(65536)
    except HTTPError as exc:
        return exc.code, exc.read(4096)

errors = []
checks = []
try:
    code, body = request('/api/v1/seo/status')
    if code != 200:
        errors.append(f'Public status HTTP {code}, expected 200')
    else:
        payload = json.loads(body)
        expected = ('totalHits24h', 'totalHits7d', 'avgDurationMs',
                    'botDistribution', 'statusDistribution', 'stockCoverage', 'guideCoverage', 'sitemapUrl')
        missing = [key for key in expected if key not in payload]
        if missing:
            errors.append(f'Public status missing canonical fields: {missing}; possible Spring sample')
        if any(x in payload for x in ('indexNowKey', 'recentLogs', 'ipAddress', 'userAgent', 'totalCrawls', 'healthyPercent')):
            errors.append('Public status contains secrets, raw records or sample-only Spring fields')
        if not isinstance(payload.get('totalHits24h'), int) or not isinstance(payload.get('totalHits7d'), int):
            errors.append('Public hit fields are invalid')
        if not isinstance(payload.get('botDistribution'), dict):
            errors.append('Public bot distribution is invalid')
        if not errors:
            checks.append('public_schema_and_privacy')
    for path in ('/api/v1/seo/status/admin', '/api/v1/seo/gsc/analytics',
                 '/api/v1/seo/crawl-audit'):
        code, _ = request(path)
        if code not in (401, 403):
            errors.append(f'{path} returned {code}, expected admin rejection 401/403')
        else:
            checks.append('denied:' + path)
    code, _ = request('/api/v1/seo/submit', method='POST')
    if code not in (401, 403):
        errors.append(f'Unauthenticated IndexNow submission returned {code}, expected 401/403')
    else:
        checks.append('denied:IndexNow_submit')
except (URLError, TimeoutError, ValueError, json.JSONDecodeError) as exc:
    errors.append('Gateway unavailable or malformed JSON: ' + repr(exc))
print('PASS=' + ','.join(checks))
for err in errors:
    print('FAIL=' + err, file=sys.stderr)
if errors:
    sys.exit(1)
print('RESULT=PASS (read-only, no credentials, no external IndexNow submissions)')
