# 경로별 QA 원장 — 2026-11-21

[판정·재현·기능군·검사 한계](2026-11-21-all-functions-nov18-audit.ko.md). RENDER는 정상 업무 완료가 아니다. 동적25개는 각 패턴의 한 fixture이며 모든 entity 조합/모바일을 뜻하지 않는다.

## 정적147개: PC1440 / 모바일390

| 경로 | PC | 모바일 | UI 계열 | PC 버튼/입력 수 |
|---|---|---|---|---|
| `/` | RENDER_ONLY | RENDER_ONLY | Nov18 native/부분 | 3/1 |
| `/account` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/account-deletion` | RENDER_ONLY | RENDER_ONLY | Nov18 native/부분 | 1/1 |
| `/account/notifications` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/account/privacy` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/account/security` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/advisor` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/announcements` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/arcade` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/bank` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/bank/savings-pot` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/blog` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 19/1 |
| `/board` | RENDER_ONLY | RENDER_ONLY | prototype/미완성 | 3/1 |
| `/bonds` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/businesses` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/businesses/ventures` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/calculators` | RENDER_ONLY | RENDER_ONLY | Nov18 native/부분 | 3/4 |
| `/calendar` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/casino` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/central-bank` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/chat` | RENDER_ONLY | RENDER_ONLY | Nov18 native/부분 | 2/1 |
| `/clubs` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/clubs/new` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/clubs/warfare` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/collections` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/dashboard` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/data-deletion` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/design-preview` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/developer` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/enterprises` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/features` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 34/1 |
| `/forgot-password` | RENDER_ONLY | RENDER_ONLY | Nov18 native/부분 | 1/1 |
| `/fx` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/gallery` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/gallery/submit` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/guide` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 3/1 |
| `/guide/career-mastery` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/guide/dopamine-system` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/guide/glossary` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/guide/stock-trading` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/guide/virtual-banking` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/help` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/inventory` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/kdic` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/lobby` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/login` | RENDER_ONLY | RENDER_ONLY | Nov18 native/부분 | 2/6 |
| `/login/providers` | RENDER_ONLY | RENDER_ONLY | Nov18 native/부분 | 2/6 |
| `/marketplace` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/marketplace/auction` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/mint` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/newspaper` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/pension` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/prediction` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/privacy` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 14/0 |
| `/profile` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/profile/settings` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/progression` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/progression/prestige` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/quests` | RENDER_ONLY | RENDER_ONLY | prototype/미완성 | 3/1 |
| `/register` | RENDER_ONLY | RENDER_ONLY | Nov18 native/부분 | 2/7 |
| `/reset-password` | RENDER_ONLY | RENDER_ONLY | Nov18 native/부분 | 1/1 |
| `/roadmap` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 14/0 |
| `/safety` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 14/0 |
| `/safety/takedown` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/search` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/seasons` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/shop` | RENDER_ONLY | RENDER_ONLY | prototype/미완성 | 3/1 |
| `/shop/catalog` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/spaces` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/spaces/real-estate` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/status` | RENDER_ONLY | RENDER_ONLY | prototype/미완성 | 3/1 |
| `/stocks` | RENDER_ONLY | RENDER_ONLY | prototype/미완성 | 3/1 |
| `/stocks/alerts` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/stocks/community` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/stocks/compare` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/stocks/derivatives` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/stocks/history` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/stocks/league` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/stocks/portfolio` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/stocks/watchlist` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/support` | RENDER_ONLY | RENDER_ONLY | Nov18 native/부분 | 2/1 |
| `/terms` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 14/0 |
| `/tools` | RENDER_ONLY | RENDER_ONLY | Nov18 native/부분 | 3/4 |
| `/tools/capital-gains-tax-calculator` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/tools/compound-calculator` | RENDER_ONLY | RENDER_ONLY | Nov18 native/부분 | 3/6 |
| `/tools/crypto-apy-calculator` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/tools/dividend-tax-calculator` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/tools/farming-calculator` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/tools/fire-calculator` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/tools/gift-tax-calculator` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/tools/goal-wealth-calculator` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/tools/isa-calculator` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/tools/kimchi-premium-calculator` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/tools/loan-interest-calculator` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/tools/pension-tax-calculator` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/tools/quant-studio` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/tools/real-estate-calculator` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 20/7 |
| `/tools/retirement-calculator` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/tools/salary-calculator` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/tools/stock-calculator` | RENDER_ONLY | RENDER_ONLY | Nov18 native/부분 | 3/7 |
| `/tools/tax-calculator` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 27/3 |
| `/tools/youth-leap-calculator` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/treasury` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/verify-email` | RENDER_ONLY | RENDER_ONLY | Nov18 native/부분 | 1/1 |
| `/verify-email-change` | RENDER_ONLY | RENDER_ONLY | Nov18 native/부분 | 1/1 |
| `/wallet` | RENDER_ONLY | RENDER_ONLY | Nov18 native/부분 | 4/1 |
| `/wallet/activity` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/work` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 0/0 |
| `/admin` | RENDER_ONLY | RENDER_ONLY | Nov18 native/부분 | 1/3 |
| `/admin/users` | RENDER_ONLY | RENDER_ONLY | Nov18 native/부분 | 2/3 |
| `/admin/economy` | RENDER_ONLY | RENDER_ONLY | Nov18 native/부분 | 1/1 |
| `/admin/shop` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 18/0 |
| `/admin/blog` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 226/0 |
| `/admin/market` | RENDER_ONLY | RENDER_ONLY | Nov18 native/부분 | 1/1 |
| `/admin/enterprises` | RENDER_ONLY | RENDER_ONLY | Nov18 native/부분 | 1/1 |
| `/admin/controls` | RENDER_ONLY | RENDER_ONLY | Nov18 native/부분 | 1/1 |
| `/admin/analytics` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 25/0 |
| `/admin/logs` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 18/0 |
| `/admin/security` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 20/0 |
| `/admin/support` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 18/0 |
| `/admin/mint` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 23/0 |
| `/admin/central-bank` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 19/0 |
| `/admin/treasury` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 47/5 |
| `/admin/bonds` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 21/0 |
| `/admin/pension` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 20/0 |
| `/admin/fx` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 18/0 |
| `/admin/treasury/grants` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 28/0 |
| `/admin/kdic` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 21/0 |
| `/admin/catalog` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 18/0 |
| `/admin/work` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 18/0 |
| `/admin/economy/scenario-lab` | RENDER_ONLY | RENDER_ONLY | Nov18 native/부분 | 1/1 |
| `/admin/market/ai-news` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 18/0 |
| `/admin/logs/errors` | FAIL/BLOCKED 화면 | FAIL/BLOCKED 화면 | 검수 불가 | 13/0 |
| `/admin/logs/system` | RENDER_ONLY | RENDER_ONLY | Nov18 native/부분 | 2/4 |
| `/admin/logs/integrity` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 20/2 |
| `/admin/logs/delivery` | RENDER_ONLY | RENDER_ONLY | Nov18 native/부분 | 1/1 |
| `/admin/money-flow` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 19/3 |
| `/admin/content` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 25/15 |
| `/admin/safety` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 20/0 |
| `/admin/api-health` | RENDER_ONLY | RENDER_ONLY | Nov18 native/부분 | 1/1 |
| `/admin/seo` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 42/5 |
| `/admin/seo-audit` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 19/0 |
| `/admin/discord` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 18/0 |
| `/admin/operations/storage` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 18/0 |
| `/admin/bank` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 18/0 |
| `/admin/help` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 18/0 |
| `/admin/logs/activity` | RENDER_ONLY | RENDER_ONLY | 구형·혼합/불일치 | 22/3 |

## 동적33개

| 패턴 | 탐색 결과 | fixture |
|---|---|---|
| `/[locale]/blog` | FAIL_CONTENT_FALLBACK | PUBLIC_CATALOG_OR_VISIBLE_QA_ENTITY_ATTEMPTED |
| `/[locale]/blog/[slug]` | FAIL_CONTENT_FALLBACK | PUBLIC_CATALOG_OR_VISIBLE_QA_ENTITY_ATTEMPTED |
| `/[locale]/guide/glossary` | FAIL_ROUTE | PUBLIC_CATALOG_OR_VISIBLE_QA_ENTITY_ATTEMPTED |
| `/[locale]/guide/glossary/[term]` | FAIL_ROUTE | PUBLIC_CATALOG_OR_VISIBLE_QA_ENTITY_ATTEMPTED |
| `/[locale]/tools/compound-interest-calculator` | FAIL_ROUTE | PUBLIC_CATALOG_OR_VISIBLE_QA_ENTITY_ATTEMPTED |
| `/[locale]/tools/compound-interest-calculator/[preset]` | FAIL_ROUTE | PUBLIC_CATALOG_OR_VISIBLE_QA_ENTITY_ATTEMPTED |
| `/admin/users/[id]` | FAIL_CONTENT_FALLBACK | PUBLIC_CATALOG_OR_VISIBLE_QA_ENTITY_ATTEMPTED |
| `/announcements/[announcementId]` | BLOCKED_FIXTURE | NEEDS_AUTHORIZED_FIXTURE |
| `/blog/[slug]` | FAIL_CONTENT_FALLBACK | PUBLIC_CATALOG_OR_VISIBLE_QA_ENTITY_ATTEMPTED |
| `/board/[postId]` | BLOCKED_FIXTURE | NEEDS_AUTHORIZED_FIXTURE |
| `/clubs/[clubId]` | BLOCKED_FIXTURE | NEEDS_AUTHORIZED_FIXTURE |
| `/clubs/[clubId]/members` | BLOCKED_FIXTURE | NEEDS_AUTHORIZED_FIXTURE |
| `/gallery/[photoId]` | BLOCKED_FIXTURE | NEEDS_AUTHORIZED_FIXTURE |
| `/guide/glossary/[term]` | FAIL_ROUTE | PUBLIC_CATALOG_OR_VISIBLE_QA_ENTITY_ATTEMPTED |
| `/help/[slug]` | BLOCKED_FIXTURE | NEEDS_AUTHORIZED_FIXTURE |
| `/invite/[code]` | BLOCKED_FIXTURE | NEEDS_AUTHORIZED_FIXTURE |
| `/profile/[userId]` | FAIL_ROUTE | PUBLIC_CATALOG_OR_VISIBLE_QA_ENTITY_ATTEMPTED |
| `/stocks/[symbol]` | FAIL_ROUTE | PUBLIC_CATALOG_OR_VISIBLE_QA_ENTITY_ATTEMPTED |
| `/tools/capital-gains-tax-calculator/[preset]` | FAIL_ROUTE | PUBLIC_CATALOG_OR_VISIBLE_QA_ENTITY_ATTEMPTED |
| `/tools/compound-calculator/[preset]` | FAIL_ROUTE | PUBLIC_CATALOG_OR_VISIBLE_QA_ENTITY_ATTEMPTED |
| `/tools/dividend-tax-calculator/[ticker]` | FAIL_ROUTE | PUBLIC_CATALOG_OR_VISIBLE_QA_ENTITY_ATTEMPTED |
| `/tools/farming-calculator/[preset]` | FAIL_ROUTE | PUBLIC_CATALOG_OR_VISIBLE_QA_ENTITY_ATTEMPTED |
| `/tools/gift-tax-calculator/[preset]` | FAIL_ROUTE | PUBLIC_CATALOG_OR_VISIBLE_QA_ENTITY_ATTEMPTED |
| `/tools/isa-calculator/[slug]` | FAIL_ROUTE | PUBLIC_CATALOG_OR_VISIBLE_QA_ENTITY_ATTEMPTED |
| `/tools/kimchi-premium-calculator/[preset]` | FAIL_ROUTE | PUBLIC_CATALOG_OR_VISIBLE_QA_ENTITY_ATTEMPTED |
| `/tools/loan-interest-calculator/[preset]` | FAIL_ROUTE | PUBLIC_CATALOG_OR_VISIBLE_QA_ENTITY_ATTEMPTED |
| `/tools/pension-tax-calculator/[slug]` | FAIL_ROUTE | PUBLIC_CATALOG_OR_VISIBLE_QA_ENTITY_ATTEMPTED |
| `/tools/real-estate-calculator/[preset]` | FAIL_ROUTE | PUBLIC_CATALOG_OR_VISIBLE_QA_ENTITY_ATTEMPTED |
| `/tools/retirement-calculator/[slug]` | FAIL_ROUTE | PUBLIC_CATALOG_OR_VISIBLE_QA_ENTITY_ATTEMPTED |
| `/tools/salary-calculator/[preset]` | FAIL_ROUTE | PUBLIC_CATALOG_OR_VISIBLE_QA_ENTITY_ATTEMPTED |
| `/tools/stock-calculator/[preset]` | FAIL_ROUTE | PUBLIC_CATALOG_OR_VISIBLE_QA_ENTITY_ATTEMPTED |
| `/tools/youth-leap-calculator/[preset]` | FAIL_ROUTE | PUBLIC_CATALOG_OR_VISIBLE_QA_ENTITY_ATTEMPTED |
| `/wallet/activity/transactions/[transactionId]` | BLOCKED_FIXTURE | NEEDS_AUTHORIZED_FIXTURE |

## 별칭41개

| 경로 | 화면 결과 |
|---|---|
| `/account-deletion.html` | RENDER/REDIRECT_ONLY |
| `/account-deletion/` | RENDER/REDIRECT_ONLY |
| `/account-deletion/index.html` | RENDER/REDIRECT_ONLY |
| `/admin-preview` | FAIL/BLOCKED 화면 |
| `/admin-preview.html` | FAIL/BLOCKED 화면 |
| `/admin-preview/` | FAIL/BLOCKED 화면 |
| `/admin-preview/index.html` | FAIL/BLOCKED 화면 |
| `/admin.html` | FAIL/BLOCKED 화면 |
| `/admin/` | RENDER/REDIRECT_ONLY |
| `/admin/index.html` | RENDER/REDIRECT_ONLY |
| `/chat.html` | RENDER/REDIRECT_ONLY |
| `/chat/` | RENDER/REDIRECT_ONLY |
| `/chat/index.html` | RENDER/REDIRECT_ONLY |
| `/forgot-password.html` | RENDER/REDIRECT_ONLY |
| `/forgot-password/` | RENDER/REDIRECT_ONLY |
| `/forgot-password/index.html` | RENDER/REDIRECT_ONLY |
| `/index.html` | RENDER/REDIRECT_ONLY |
| `/login.html` | RENDER/REDIRECT_ONLY |
| `/login/` | RENDER/REDIRECT_ONLY |
| `/login/index.html` | RENDER/REDIRECT_ONLY |
| `/login/providers.html` | RENDER/REDIRECT_ONLY |
| `/login/providers/` | RENDER/REDIRECT_ONLY |
| `/login/providers/index.html` | RENDER/REDIRECT_ONLY |
| `/register.html` | RENDER/REDIRECT_ONLY |
| `/register/` | RENDER/REDIRECT_ONLY |
| `/register/index.html` | RENDER/REDIRECT_ONLY |
| `/reset-password.html` | RENDER/REDIRECT_ONLY |
| `/reset-password/` | RENDER/REDIRECT_ONLY |
| `/reset-password/index.html` | RENDER/REDIRECT_ONLY |
| `/support.html` | RENDER/REDIRECT_ONLY |
| `/support/` | RENDER/REDIRECT_ONLY |
| `/support/index.html` | RENDER/REDIRECT_ONLY |
| `/verify-email-change.html` | RENDER/REDIRECT_ONLY |
| `/verify-email-change/` | RENDER/REDIRECT_ONLY |
| `/verify-email-change/index.html` | RENDER/REDIRECT_ONLY |
| `/verify-email.html` | RENDER/REDIRECT_ONLY |
| `/verify-email/` | RENDER/REDIRECT_ONLY |
| `/verify-email/index.html` | RENDER/REDIRECT_ONLY |
| `/wallet.html` | RENDER/REDIRECT_ONLY |
| `/wallet/` | RENDER/REDIRECT_ONLY |
| `/wallet/index.html` | RENDER/REDIRECT_ONLY |

## 상태 해석

`FAIL_ROUTE`는 운영 오류/차단 본문 관찰이다. 의도된 접근 거부는 정책 확인이 필요하다. `FAIL_CONTENT_FALLBACK`는 상세 대신 홈이 나온 경우다. `BLOCKED_FIXTURE`는 유효하고 안전한 대상/영수증 fixture가 없어 양성 검사를 하지 못한 경우다. 나머지도 source-API-DB-test-영수증 수용까지 통과한 것이 아니다.
