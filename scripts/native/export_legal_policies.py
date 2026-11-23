#!/usr/bin/env python3
"""Export exact authored EN/KO policy JSX articles to Spring-only static Thymeleaf pages.
No network, no JavaScript runtime, and no user-generated HTML. Run after policy copy changes.
"""
from pathlib import Path
import re
import hashlib
ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/'frontend/src/components/policy'
OUTPUT=ROOT/'spring-backend/src/main/resources/templates/mv43'
HTML="""<!doctype html>
<html lang="en" xmlns:th="http://www.thymeleaf.org" th:lang="${uiLanguage}" th:attr="data-ui-language=${uiLanguage}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="color-scheme" content="dark"><meta name="theme-color" content="#0C1020">
<meta name="robots" content="noindex,nofollow,noarchive">
<title th:text="${legalTitle + ' | Woldeok Moneyverse'}">Woldeok Moneyverse legal policy</title>
<link rel="stylesheet" href="/assets/mv39/site.css">
<link rel="stylesheet" href="/assets/mv43/chrome.css">
<link rel="stylesheet" href="/assets/mv43/legal.css">
<script defer src="/assets/mv39/i18n.js"></script>
<th:block th:replace="~{shared/chrome :: commonHead}"></th:block>
</head>
<body data-spring-page="legal">
<a class="skip-link" href="#main-content" th:text="${uiCopy['publicSkip']}">Skip to main content</a>
<div class="app-shell"><th:block th:replace="~{shared/chrome :: sidebar}"></th:block>
<div class="app-main"><div class="app-inner">
<th:block th:replace="~{shared/chrome :: pageHeader}"></th:block>
<main id="main-content" class="legal-main" tabindex="-1">
<section class="hero"><div class="hero-text"><div class="eyebrow">WOLDEOK MONEYVERSE</div>
<h1 th:text="${legalTitle}">Legal policy</h1>
<p th:if="${policyFallback}" class="legal-fallback" lang="en">The full policy text is available in English for this language. The original Korean version is also available.</p>
</div></section>
<!-- Policy text below is exported verbatim from the existing authored React policy document; no legal text is invented. -->
__ARTICLE__
</main>
<th:block th:replace="~{shared/chrome :: footer}"></th:block>
</div></div></div>
<th:block th:replace="~{shared/chrome :: mobileNavigation}"></th:block>
<th:block th:replace="~{shared/chrome :: support}"></th:block>
</body></html>
"""
ALLOWED={'article','p','dl','dt','dd','aside','strong','section','h2','ul','ol','li','nav','a','div','table','thead','tbody','tr','th','td','br','span'}
for name in ('terms','privacy'):
    src=(SOURCE/f'{name}-document.tsx').read_text(encoding='utf-8')
    articles=re.findall(r'<article\b[\s\S]*?</article>',src)
    if len(articles)!=2: raise SystemExit(f'Expected exactly 2 source articles for {name}, found {len(articles)}')
    for lang,article in zip(('en','ko'),articles):
        article=article.replace('className=','class=').replace('tabIndex={0}','tabindex="0"').replace('tabIndex=','tabindex=').replace('<Link ','<a ').replace('</Link>','</a>')
        tags={m.group(1).lower() for m in re.finditer(r'<\s*/?\s*([a-zA-Z][a-zA-Z0-9]*)',article)}
        if tags-ALLOWED:raise SystemExit(f'Unsafe/unexpected JSX elements in {name}/{lang}: {tags-ALLOWED}')
        if re.search(r'(?i)\bon\w+\s*=|\s(?:src|style)\s*=|javascript:|<script|<iframe|\{\s*[^}]',article):
            raise SystemExit(f'Unsafe JSX markup in {name}/{lang}')
        if '2026-09-02' not in article:raise SystemExit(f'Policy version missing from {name}/{lang}')
        article=article.replace('<article ',f'<article lang="{lang}" data-policy-language="{lang}" ')
        destination=OUTPUT/f'legal-{name}-{lang}.html'
        template=HTML.replace('__ARTICLE__',article)
        for asset in ('/assets/mv39/site.css','/assets/mv43/chrome.css','/assets/mv43/legal.css','/assets/mv39/i18n.js'):
            digest=hashlib.sha256((ROOT/'spring-backend/src/main/resources/static'/asset.lstrip('/')).read_bytes()).hexdigest()
            template=template.replace('"'+asset+'"','"'+asset+'?v='+digest+'"')
        destination.write_text(template,encoding='utf-8')
        print(f'{destination.relative_to(ROOT)} authored-article characters={len(article)}')
