#!/usr/bin/env python3
"""Local-only design harness. Test fixture only, NOT production Spring or real member data."""
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit, parse_qs
import sys

ASSETS = Path(__file__).resolve().parents[2] / 'main/resources/static'

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        route = urlsplit(self.path)
        if route.path.startswith('/mv-spring/'):
            target = (ASSETS / route.path.lstrip('/')).resolve()
            if not target.is_file() or not target.is_relative_to(ASSETS.resolve()):
                self.send_error(404)
                return
            data = target.read_bytes()
            self.send_response(200)
            self.send_header('Content-Type', 'text/javascript' if target.suffix == '.mjs'
                             else 'text/css' if target.suffix == '.css' else 'application/octet-stream')
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        if route.path not in ('/native', '/native/next'):
            self.send_error(404)
            return
        query = parse_qs(route.query)
        lang = query.get('lang', ['en'])[0]
        lang = lang if lang in ('en', 'ko') else 'en'
        html = f"""<!doctype html><html lang="{lang}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Spring language picker browser fixture</title>
<link rel="stylesheet" href="/mv-spring/v38/shared-ui.css">
<link rel="stylesheet" href="/mv-spring/v39/language-picker.css">
<script type="module" src="/mv-spring/v39/language-picker.mjs"></script>
<style>
*{{box-sizing:border-box}}body{{margin:0;background:#0b1223;color:#fff;font-family:system-ui}}
header{{background:#151f38;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;padding:12px 14px}}
main{{margin:auto;max-width:900px;min-height:800px;padding:24px 16px 140px}}
nav.fixed{{position:fixed;bottom:0;left:0;right:0;height:80px;background:#23254c;display:flex;justify-content:space-around;align-items:center}}
nav.fixed a{{color:white}}
</style></head><body>
<header><strong>WOLDEOK MONEYVERSE</strong><div class="mv-language-slot" data-mv-language-slot data-mv-native-translations="en,ko">
<details><summary aria-label="Choose language">🌐 Language</summary><div class="mv-language-fallback-links">
<a data-mv-auto href="?lang=en&amp;mv_auto=1">Auto</a>
<a data-lang="en" href="?lang=en">English</a><a data-lang="ko" href="?lang=ko">한국어</a>
<a data-lang="ja" href="?lang=ja">日本語</a><a data-lang="zh" href="?lang=zh">简体中文</a>
<a data-lang="vi" href="?lang=vi">Tiếng Việt</a></div></details></div></header>
<main><h1 id="native-title">{'네이티브 화면' if lang == 'ko' else 'Native Spring page'}</h1>
<p>LOCAL TEST FIXTURE. No real accounts, API or financial data.</p>
<a href="/native/next">Next native page</a></main>
<details class="mv-support-dock"><summary><span>?</span><span>Help</span></summary><section class="mv-support-panel">Only help navigation</section></details>
<nav class="fixed"><a href="/native">Home</a><a href="/native/next">Next</a></nav>
</body></html>"""
        data = html.encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

if __name__ == '__main__':
    HTTPServer(('127.0.0.1', int(sys.argv[1])), Handler).serve_forever()
