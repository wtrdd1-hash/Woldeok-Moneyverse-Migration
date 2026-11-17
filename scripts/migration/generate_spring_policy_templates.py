#!/usr/bin/env python3
"""Generate literal, audited Thymeleaf templates from static legal Next JSX.

No runtime JS/Node. This purposely rejects dynamic expressions instead of guessing
legal text. The original EN and KO differ materially: preserve both *exactly*.
"""
from __future__ import annotations
import argparse
from html.parser import HTMLParser
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'frontend/src/components/policy'
DEST = ROOT / 'spring-backend/src/main/resources/templates/spring-policy'

META = {
  ('terms','en'): ('Terms of Service', 'Woldeok Moneyverse Terms of Service and user agreement.'),
  ('terms','ko'): ('이용약관', '월덕 머니버스 이용약관 전문'),
  ('privacy','en'): ('Privacy Policy', 'Privacy Policy and user data protection commitments of Woldeok Moneyverse.'),
  ('privacy','ko'): ('개인정보처리방침', '월덕 머니버스가 처리하는 개인정보와 이용자의 권리'),
}

def article(name: str, lang: str) -> str:
    s = (SOURCE / (name+'-document.tsx')).read_text(encoding='utf8')
    parts = re.findall(r'<article\b[\s\S]*?</article>',s)
    if len(parts)!=2: raise ValueError(f'Unexpected static source branches for {name}: {len(parts)}')
    part = parts[0 if lang=='en' else 1]
    part = (part.replace('<Link ', '<a ').replace('</Link>', '</a>')
            .replace('className=', 'class=').replace('tabIndex={0}', 'tabindex="0"'))
    if re.search(r'\{[^{}]*\}|</?Link\b|className=',part):
        raise ValueError('Dynamic JSX in legal source requires explicit human review')
    return part

def make(name: str, lang: str) -> str:
    title, description = META[(name,lang)]
    english = lang == 'en'
    nav_home = 'Home' if english else '홈'
    nav_terms = 'Terms' if english else '이용약관'
    nav_privacy = 'Privacy' if english else '개인정보처리방침'
    nav_delete = 'Account deletion' if english else '계정 삭제'
    skip = 'Skip to main content' if english else '본문으로 이동'
    document_label = 'Official service policy · 2026-09-02' if english else '공식 서비스 정책 · 2026-09-02'
    return f'''<!doctype html>
<!-- Java Spring MVC / Thymeleaf SSR; literal source: frontend/src/components/policy/{name}-document.tsx ({lang}) -->
<html lang="{lang}" xmlns:th="http://www.thymeleaf.org">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="{description}">
  <title>{title} | Woldeok Moneyverse</title>
  <link rel="canonical" href="https://easy-scraping.com/{name}">
  <link rel="stylesheet" href="/spring-policy/policy.css">
</head>
<body>
  <a class="skip-link" href="#content">{skip}</a>
  <header class="policy-header">
    <nav class="policy-nav" aria-label="Primary navigation">
      <a class="brand" href="/">Woldeok <strong>Moneyverse</strong></a>
      <div class="policy-nav-links"><a href="/">{nav_home}</a><a href="/terms">{nav_terms}</a><a href="/privacy">{nav_privacy}</a><a href="/account-deletion">{nav_delete}</a></div>
      <div class="lang-links" aria-label="Language"><a lang="en" href="/{name}?lang=en"{' aria-current="page"' if english else ''}>EN</a><a lang="ko" href="/{name}?lang=ko"{' aria-current="page"' if not english else ''}>한국어</a></div>
    </nav>
  </header>
  <main id="content" class="policy-container" tabindex="-1">
    <header class="policy-hero"><p class="policy-kicker">WOLDEOK MONEYVERSE</p><h1>{title}</h1><p class="policy-description">{description}</p><p class="document-tag">{document_label}</p></header>
    {article(name,lang)}
  </main>
  <footer class="policy-footer"><a href="/terms">{nav_terms}</a><a href="/privacy">{nav_privacy}</a><a href="/account-deletion">{nav_delete}</a><span>© Woldeok Moneyverse</span></footer>
</body>
</html>
'''

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');a=parser.parse_args()
    for name in ('terms','privacy'):
        for lang in ('en','ko'):
            target=DEST/f'{name}-{lang}.html';expected=make(name,lang)
            if a.check:
                if not target.exists() or target.read_text('utf8')!=expected:
                    raise SystemExit(f'STALE GENERATED POLICY {target.relative_to(ROOT)}')
            else:
                DEST.mkdir(parents=True,exist_ok=True);target.write_text(expected,encoding='utf8')
            print('OK',target.relative_to(ROOT),len(expected))
if __name__=='__main__':main()
